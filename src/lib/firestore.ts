import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  serverTimestamp,
  increment,
  writeBatch,
  onSnapshot,
  Query,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  Product,
  Order,
  UserProfile,
  Review,
  PromoCode,
  CartItem,
  WishlistItem,
  ProductFilters,
  SortOption,
} from '@/types'

// ─── Collection References ────────────────────────────────────────────────────

export const productsCol   = collection(db, 'products')
export const ordersCol     = collection(db, 'orders')
export const usersCol      = collection(db, 'users')
export const promoCodesCol = collection(db, 'promoCodes')

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilters = {},
  sort: SortOption = 'newest',
  pageSize = 12,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  let q: Query = productsCol

  const conditions = []
  if (filters.category)   conditions.push(where('category', '==', filters.category))
  if (filters.inStockOnly) conditions.push(where('stock', '>', 0))

  let sortField = 'createdAt'
  let sortDir: 'asc' | 'desc' = 'desc'
  if (sort === 'price-asc')  { sortField = 'price'; sortDir = 'asc' }
  if (sort === 'price-desc') { sortField = 'price'; sortDir = 'desc' }
  if (sort === 'rating')     { sortField = 'rating'; sortDir = 'desc' }
  if (sort === 'popular')    { sortField = 'reviewCount'; sortDir = 'desc' }

  const queryConstraints = [
    ...conditions,
    orderBy(sortField, sortDir),
    limit(pageSize),
  ]
  if (lastDoc) queryConstraints.push(startAfter(lastDoc))

  q = query(productsCol, ...queryConstraints)
  const snap = await getDocs(q)
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))

  // Client-side price filter
  const filtered = products.filter(p => {
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false
    return true
  })

  return {
    products: filtered,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(productsCol, where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(productsCol, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Product
}

export async function getFeaturedProducts(n = 8): Promise<Product[]> {
  const q = query(productsCol, where('featured', '==', true), limit(n))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function getNewArrivals(n = 8): Promise<Product[]> {
  const q = query(productsCol, where('newArrival', '==', true), orderBy('createdAt', 'desc'), limit(n))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function getRelatedProducts(category: string, excludeId: string, n = 4): Promise<Product[]> {
  const q = query(productsCol, where('category', '==', category), limit(n + 1))
  const snap = await getDocs(q)
  return snap.docs
    .filter(d => d.id !== excludeId)
    .slice(0, n)
    .map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(productsCol, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(productsCol, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(productsCol, id))
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  // Basic search — for production use Algolia or Typesense
  const snap = await getDocs(productsCol)
  const term = searchTerm.toLowerCase()
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Product))
    .filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.tags.some(t => t.toLowerCase().includes(term)),
    )
    .slice(0, 20)
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function getReviewsRef(productId: string) {
  return collection(db, 'products', productId, 'reviews')
}

export async function getReviews(productId: string): Promise<Review[]> {
  const ref = getReviewsRef(productId)
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review))
}

export async function addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
  const ref = getReviewsRef(productId)
  const batch = writeBatch(db)
  const reviewRef = doc(ref)
  batch.set(reviewRef, { ...review, createdAt: serverTimestamp() })
  // Update product rating
  const productRef = doc(productsCol, productId)
  batch.update(productRef, {
    reviewCount: increment(1),
    // Rating recalculation done server-side ideally; approximate here
    rating: review.rating,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function deleteReview(productId: string, reviewId: string): Promise<void> {
  await deleteDoc(doc(getReviewsRef(productId), reviewId))
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(ordersCol, {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(ordersCol, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Order
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function getAllOrders(statusFilter?: string): Promise<Order[]> {
  let q: Query = query(ordersCol, orderBy('createdAt', 'desc'))
  if (statusFilter) q = query(ordersCol, where('status', '==', statusFilter), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(ordersCol, id), { status, updatedAt: serverTimestamp() })
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(usersCol, uid))
  if (!snap.exists()) return null
  return { uid, ...snap.data() } as UserProfile
}

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> {
  await setDoc(doc(usersCol, uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(usersCol, uid), { ...data, updatedAt: serverTimestamp() })
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(usersCol)
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile))
}

// ─── Cart (Firestore) ─────────────────────────────────────────────────────────

export function getCartRef(userId: string) {
  return doc(db, 'carts', userId)
}

export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  await setDoc(getCartRef(userId), { items, updatedAt: serverTimestamp() })
}

export async function loadCart(userId: string): Promise<CartItem[]> {
  const snap = await getDoc(getCartRef(userId))
  if (!snap.exists()) return []
  return (snap.data().items ?? []) as CartItem[]
}

export function onCartSnapshot(userId: string, cb: (items: CartItem[]) => void) {
  return onSnapshot(getCartRef(userId), snap => {
    if (snap.exists()) cb((snap.data().items ?? []) as CartItem[])
    else cb([])
  })
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function getWishlistRef(userId: string) {
  return doc(db, 'wishlists', userId)
}

export async function saveWishlist(userId: string, items: WishlistItem[]): Promise<void> {
  await setDoc(getWishlistRef(userId), { items, updatedAt: serverTimestamp() })
}

export async function loadWishlist(userId: string): Promise<WishlistItem[]> {
  const snap = await getDoc(getWishlistRef(userId))
  if (!snap.exists()) return []
  return (snap.data().items ?? []) as WishlistItem[]
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────

export async function validatePromoCode(code: string, orderSubtotal: number): Promise<PromoCode | null> {
  const q = query(promoCodesCol, where('code', '==', code.toUpperCase()), where('isActive', '==', true), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null

  const promo = { id: snap.docs[0].id, ...snap.docs[0].data() } as PromoCode
  if (promo.expiresAt && promo.expiresAt.toDate() < new Date()) return null
  if (promo.minOrderValue && orderSubtotal < promo.minOrderValue) return null
  if (promo.maxUsage && promo.usageCount >= promo.maxUsage) return null

  return promo
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const snap = await getDocs(promoCodesCol)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode))
}

export async function createPromoCode(data: Omit<PromoCode, 'id' | 'usageCount'>): Promise<string> {
  const ref = await addDoc(promoCodesCol, { ...data, usageCount: 0 })
  return ref.id
}

export async function updatePromoCode(id: string, data: Partial<PromoCode>): Promise<void> {
  await updateDoc(doc(promoCodesCol, id), data)
}

export { Timestamp, serverTimestamp }
