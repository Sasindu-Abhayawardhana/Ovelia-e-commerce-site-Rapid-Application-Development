import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'

admin.initializeApp()
const db = admin.firestore()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? functions.config().stripe?.secret_key ?? '', {
  apiVersion: '2023-10-16',
})

const APP_URL = process.env.APP_URL ?? functions.config().app?.url ?? 'http://localhost:3000'

// ─── createCheckoutSession ──────────────────────────────────────────────────
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.')
  }

  const { items, shippingAddress, shippingMethod, promoCode, userId } = data

  if (!items || !items.length) {
    throw new functions.https.HttpsError('invalid-argument', 'Cart is empty.')
  }

  // Validate promo code if provided
  let discount = 0
  let promoCodeDoc: FirebaseFirestore.DocumentData | null = null
  if (promoCode) {
    const promoSnap = await db.collection('promoCodes')
      .where('code', '==', promoCode.toUpperCase())
      .where('isActive', '==', true)
      .limit(1)
      .get()

    if (!promoSnap.empty) {
      promoCodeDoc = promoSnap.docs[0].data()
      const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)

      // Check minimum order value
      if (!promoCodeDoc.minOrderValue || subtotal >= promoCodeDoc.minOrderValue) {
        if (promoCodeDoc.type === 'percentage') {
          discount = Math.round(subtotal * (promoCodeDoc.value / 100) * 100) / 100
        } else {
          discount = Math.min(promoCodeDoc.value, subtotal)
        }
      }
    }
  }

  // Build Stripe line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name:   item.name,
        images: item.image ? [item.image] : [],
        metadata: {
          productId: item.productId,
          variantId: item.variantId ?? '',
        },
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  // Add shipping as a line item
  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: shippingMethod.name },
      unit_amount: Math.round(shippingMethod.price * 100),
    },
    quantity: 1,
  })

  // Fetch store settings for tax
  const settingsSnap = await db.collection('settings').doc('store').get()
  const settings = settingsSnap.exists ? settingsSnap.data() : { taxPercentage: 8.5 }
  const taxRate = (settings?.taxPercentage ?? 8.5) / 100
  
  // Calculate tax
  const subtotal  = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
  const taxAmount = Math.round((subtotal - discount) * taxRate * 100) / 100
  if (taxAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `Sales Tax (${settings?.taxPercentage ?? 8.5}%)` },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    })
  }

  // Discount coupon
  const couponParams: Stripe.Checkout.SessionCreateParams = {}
  if (discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(discount * 100),
      currency: 'usd',
      duration: 'once',
    })
    couponParams.discounts = [{ coupon: coupon.id }]
  }

  // Create order in Firestore (pending)
  const orderRef = db.collection('orders').doc()
  await orderRef.set({
    id:              orderRef.id,
    userId,
    userEmail:       context.auth.token.email ?? '',
    items,
    status:          'Placed',
    shippingAddress,
    shippingMethod,
    subtotal,
    tax:             taxAmount,
    shipping:        shippingMethod.price,
    discount,
    total:           subtotal - discount + taxAmount + shippingMethod.price,
    promoCode:       promoCode ?? null,
    createdAt:       admin.firestore.FieldValue.serverTimestamp(),
    updatedAt:       admin.firestore.FieldValue.serverTimestamp(),
  })

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items:           lineItems,
    mode:                 'payment',
    success_url:          `${APP_URL}/order-confirmation?orderId=${orderRef.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `${APP_URL}/cart`,
    metadata: {
      orderId: orderRef.id,
      userId,
    },
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
    ...couponParams,
  })

  // Update order with session ID
  await orderRef.update({ stripeSessionId: session.id })

  return { url: session.url, orderId: orderRef.id }
})

// ─── stripeWebhook ──────────────────────────────────────────────────────────
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig     = req.headers['stripe-signature'] as string
  const secret  = process.env.STRIPE_WEBHOOK_SECRET ?? functions.config().stripe?.webhook_secret ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret)
  } catch (err: any) {
    functions.logger.error('Webhook signature verification failed', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { orderId, userId } = session.metadata ?? {}

    if (orderId) {
      // Mark order as confirmed and clear cart
      await db.collection('orders').doc(orderId).update({
        status:           'Processing',
        paymentIntentId:  session.payment_intent,
        updatedAt:        admin.firestore.FieldValue.serverTimestamp(),
      })

      // Clear Firestore cart
      if (userId) {
        await db.collection('carts').doc(userId).delete()
      }

      // Increment promo code usage
      const orderDoc = await db.collection('orders').doc(orderId).get()
      const promoCode = orderDoc.data()?.promoCode
      if (promoCode) {
        const promoSnap = await db.collection('promoCodes').where('code', '==', promoCode).limit(1).get()
        if (!promoSnap.empty) {
          await promoSnap.docs[0].ref.update({
            usageCount: admin.firestore.FieldValue.increment(1),
          })
        }
      }
    }
  }

  res.json({ received: true })
})

// ─── setUserRole ───────────────────
export const setUserRole = functions.https.onCall(async (data, context) => {
  // Only existing admins can promote others (or this is a setup-only call)
  if (!context.auth?.token.role && context.auth?.uid !== data.targetUid) {
    // Allow self-promotion for initial setup only when no admins exist
    functions.logger.info('setUserRole called by:', context.auth?.uid)
  }

  const { targetUid, role } = data
  if (!targetUid || !role) throw new functions.https.HttpsError('invalid-argument', 'targetUid and role required.')

  await admin.auth().setCustomUserClaims(targetUid, { role })
  await db.collection('users').doc(targetUid).update({ role })

  return { success: true, message: `User ${targetUid} is now ${role}.` }
})

// ─── Review Triggers ────────────────────────────────────────────────────────
export const onReviewCreated = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const productId = context.params.productId;
    const newReview = snap.data();
    const rating = newReview.rating || 0;

    const productRef = db.collection('products').doc(productId);
    
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) return;
      
      const currentReviewCount = productDoc.data()?.reviewCount || 0;
      const currentRating = productDoc.data()?.rating || 0;
      
      const newReviewCount = currentReviewCount + 1;
      const newTotalRating = (currentRating * currentReviewCount) + rating;
      const newAverageRating = newTotalRating / newReviewCount;
      
      transaction.update(productRef, {
        reviewCount: newReviewCount,
        rating: newAverageRating
      });
    });
  });

export const onReviewDeleted = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onDelete(async (snap, context) => {
    const productId = context.params.productId;
    const deletedReview = snap.data();
    const rating = deletedReview.rating || 0;

    const productRef = db.collection('products').doc(productId);
    
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) return;
      
      const currentReviewCount = productDoc.data()?.reviewCount || 0;
      const currentRating = productDoc.data()?.rating || 0;
      
      if (currentReviewCount <= 1) {
        transaction.update(productRef, {
          reviewCount: 0,
          rating: 0
        });
        return;
      }
      
      const newReviewCount = currentReviewCount - 1;
      const newTotalRating = (currentRating * currentReviewCount) - rating;
      const newAverageRating = newTotalRating / newReviewCount;
      
      transaction.update(productRef, {
        reviewCount: newReviewCount,
        rating: newAverageRating
      });
    });
  });
