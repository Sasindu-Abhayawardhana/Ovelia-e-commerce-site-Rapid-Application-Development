# Ovelia E-Commerce: Features & Requirements Specification

This document details the complete feature set, component architecture, and the Functional (FR) and Non-Functional (NFR) requirements for the Ovelia e-commerce application.

---

## 1. Core Features

### Customer-Facing Features
*   **Authentication & Accounts:** Secure sign-up/login via Email & Password or Google OAuth. Dedicated account pages for profile management.
*   **Product Catalog & Search:** Responsive product grid with advanced filtering (by category, price) and keyword search functionality.
*   **Product Details:** Detailed product pages featuring image galleries, variant selection (size/color), real-time stock status, and average star ratings.
*   **Shopping Cart & Wishlist:** Slide-out cart drawer for easy access. Users can add/remove items, update quantities, and save items to a wishlist for later.
*   **Checkout & Payments:** Secure checkout flow integrated with Stripe. Supports applying promotional discount codes (percentage, fixed amount, or free shipping).
*   **Order Tracking:** Users can view a complete history of their past orders, including current fulfillment status and shipping details.
*   **Product Reviews:** Customers can leave star ratings and written reviews on products they have purchased.

### Admin-Facing Features (Role-Restricted)
*   **Admin Dashboard:** High-level overview of store performance, total sales, and recent activity.
*   **Product Management:** Full CRUD (Create, Read, Update, Delete) capabilities for the product catalog. Admins can update stock levels, prices, and upload product images.
*   **Order Fulfillment:** View all customer orders across the platform and update their statuses (e.g., Pending, Processing, Shipped, Delivered).
*   **Promo Code Management:** Generate and manage active discount codes, setting rules like minimum order values and discount types.
*   **Customer & Review Moderation:** View registered users and monitor/moderate product reviews.

---

## 2. Component Architecture

The React application is highly modular, utilizing reusable UI components and domain-specific feature components.

*   **Layout Components:** `Header`, `Footer`, `Layout` (Public/Customer wrapper), `AdminLayout` (Dashboard wrapper).
*   **Authentication Guards:** `AuthGuard` (protects customer routes), `AdminGuard` (protects admin routes by verifying custom claims).
*   **Product Components:** `ProductCard`, `ProductGrid`, `ProductFilters`, `ProductImageGallery`, `VariantSelector`, `ReviewCard`, `ReviewForm`.
*   **Cart Components:** `CartDrawer`, `CartItem`, `CartSummary`, `PromoCodeInput`.
*   **Reusable UI (Design System):** `Button`, `Input`, `Badge`, `Modal`, `Skeleton` (loading states), `StarRating`, `EmptyState`, `ChatWidget`.

---

## 3. Functional Requirements (FR)

Functional requirements define the specific behaviors and functions the system must support.

*   **FR-1 [Auth]:** The system shall allow users to register, log in, and log out using Firebase Authentication.
*   **FR-2 [Catalog]:** The system shall retrieve and display product data from Firestore, allowing users to filter by category.
*   **FR-3 [Cart]:** The system shall maintain a persistent shopping cart state for authenticated users across sessions.
*   **FR-4 [Checkout]:** The system shall securely generate a Stripe Checkout session via Cloud Functions when a user initiates payment.
*   **FR-5 [Promotions]:** The system shall validate promotional codes entered by the user against the `promoCodes` collection and apply the appropriate discount to the cart total.
*   **FR-6 [Orders]:** The system shall automatically generate an order record in Firestore upon successful payment webhook confirmation from Stripe.
*   **FR-7 [Reviews]:** The system shall allow authenticated users to submit a review (1-5 stars and text) for products.
*   **FR-8 [Admin Authorization]:** The system shall restrict access to the `/admin/*` routes and administrative Firestore operations exclusively to users possessing the `admin` custom claim.

---

## 4. Non-Functional Requirements (NFR)

Non-functional requirements define the system's operational capabilities, performance, and security posture.

*   **NFR-1 [Security & Access Control]:** Direct database access must be strictly governed by Firestore Security Rules. A user must only be able to read/write their own personal data (cart, wishlist, orders). Only admins can modify products and categories.
*   **NFR-2 [Payment Security (PCI Compliance)]:** The application must not process or store raw credit card data on its own servers. All payment processing must be offloaded to Stripe.
*   **NFR-3 [Performance]:** The Single Page Application (SPA) must provide near-instantaneous UI updates (utilizing Zustand for local state) and fluid animations (Framer Motion) to ensure a premium user experience.
*   **NFR-4 [Scalability]:** The backend infrastructure (Firebase BaaS) must automatically scale to handle traffic spikes without requiring manual server provisioning or load balancing.
*   **NFR-5 [Responsiveness]:** The user interface must be fully responsive and mobile-first, ensuring full functionality across mobile devices, tablets, and desktop monitors (implemented via Tailwind CSS).
*   **NFR-6 [Maintainability]:** The codebase must be strictly typed using TypeScript to prevent runtime errors and utilize an ESLint/Oxlint configuration to enforce code quality standards.
