# Technical Details & Rapid Application Development (RAD) Tools

This document outlines the comprehensive technical stack, infrastructure, and the cutting-edge Rapid Application Development (RAD) tools utilized to architect, build, and deploy the Ovelia E-Commerce platform.

## 1. Rapid Application Development (RAD) & AI Tooling

The development of this application heavily leveraged AI-driven workflows to accelerate the transition from concept to production-ready code.

- **Antigravity AI Agent**: An advanced autonomous agentic coding assistant developed by Google DeepMind. Antigravity acted as a paired programming co-pilot, capable of reading the codebase, planning architectural changes, executing terminal commands, creating files, and interacting with Git and Firebase CLI directly from the terminal. 
- **Gemini 3.1 Pro (Low) LLM**: The underlying Large Language Model powering the Antigravity agent. It provided the reasoning capabilities needed to design the Firestore schema, write React components, debug Cloud Functions, and ensure Stripe integration adhered to security best practices.
- **Mermaid JS**: Used for rapidly generating and rendering architectural diagrams and customer journey flowcharts directly within the documentation without needing external diagramming software.

## 2. Frontend Application Stack

The client-side application is built for high performance, type safety, and seamless user experiences.

- **Framework**: **React 18** for building the component-based UI.
- **Language**: **TypeScript** for end-to-end type safety, significantly reducing runtime errors.
- **Build Tool**: **Vite**, chosen over Webpack/CRA for its lightning-fast Hot Module Replacement (HMR) and optimized production builds.
- **State Management**: 
  - **Zustand**: A small, fast, and scalable bearbones state-management solution used for global states like the Shopping Cart, User Session (Auth), Wishlist, and UI toggles (modals/drawers).
  - **React Hook Form**: For performant, flexible, and extensible forms with easy-to-use validation.
- **Validation**: **Zod**, integrated with React Hook Form, to declare and validate the schema of user inputs strictly.
- **Styling & UI**: 
  - **Tailwind CSS**: A utility-first CSS framework for rapid UI styling directly within JSX.
  - **Framer Motion**: A production-ready motion library for React used to implement fluid micro-interactions and page transitions.
- **Routing**: **React Router v6** for handling client-side navigation.
- **Data Visualization**: **Recharts** for rendering administrative analytics and dashboards.

## 3. Backend & Serverless Infrastructure (Firebase BaaS)

Instead of a traditional monolithic server, the application utilizes Firebase as a Backend-as-a-Service (BaaS), adhering to a serverless architecture pattern.

- **Firebase Authentication**: Handles secure user sign-ups and logins (Email/Password & Google OAuth). Utilizes **Custom Claims** to securely assign and verify `admin` roles.
- **Cloud Firestore**: A NoSQL document database used as the primary data store. Collections include `users`, `products`, `orders`, `reviews`, `categories`, and `promoCodes`. Secured via strictly defined **Firestore Security Rules** evaluating user roles and ownership.
- **Firebase Cloud Storage**: Securely stores and serves user-uploaded media and product assets (images).
- **Firebase Cloud Functions**: A serverless compute framework running Node.js backend code in response to events. Used for operations that cannot be trusted to the client:
  - Interfacing with Stripe to create Checkout Sessions securely.
  - Processing Stripe Webhooks to update order statuses securely.
  - Managing user roles (promoting a user to admin).
- **Firebase Hosting**: Provides fast, secure, and reliable hosting for the Vite-built static assets (HTML/CSS/JS) on a global CDN.

## 4. Third-Party Integrations

- **Stripe API**: Used for secure, PCI-compliant payment processing. The application utilizes Stripe Checkout hosted pages, eliminating the need to handle raw credit card data on the client side.

## 5. Development & Testing Tools

- **Node.js & npm**: The runtime and package manager used to orchestrate dependencies.
- **Oxlint**: A highly performant JavaScript/TypeScript linter used to enforce code quality.
- **Playwright**: Set up for end-to-end (E2E) testing to simulate real user interactions and verify critical flows like the checkout process.
- **Vitest & React Testing Library**: For unit and integration testing of individual UI components.
