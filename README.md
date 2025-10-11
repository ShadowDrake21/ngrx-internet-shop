🛍️ InternetShop

An advanced e-commerce web application built with Angular, NgRX, RxJS, Firebase, and integrated with the Fake Store API (https://fakeapi.platzi.com/
) and Stripe for payments.

This is one of my largest and most complete Angular projects, featuring full authentication, state management, cart and order handling, and real-time data synchronization.

🎯 Overview

InternetShop provides a seamless shopping experience with both guest and authenticated user modes.

👤 Guests can:

Browse and search products

Filter by categories

View product details

🔒 Authorized users can:

Register and log in (via Firebase Authentication)

Add/remove items from cart

Make purchases (Stripe integration)

Add/remove favourites

Manage user profile and order history

⚙️ Technology Stack
Category	Technology
Frontend Framework	Angular 17
State Management	NgRX
Reactive Programming	RxJS
Backend / Auth	Firebase
API Source	Fake Store API (platzi.com
)
Payments	Stripe (Stripe Backend Repo
)
Deployment	Firebase Hosting / Netlify (optional)
🧠 Key Features

🔐 Authentication (Sign up / Sign in / Google Login)

🛒 Shopping Cart with NgRX state management

❤️ Favourites System

💳 Checkout with Stripe integration

🔍 Search & Filter by category or name

📦 Product Management (CRUD for admin users)

📊 Reactive Store — powered by RxJS & NgRX

☁️ Firebase Sync — persistent user data and cart

💬 Toast notifications & error handling

🧩 Project Structure
internet-shop/
├── src/
│   ├── app/
│   │   ├── core/            # shared services, guards, interceptors
│   │   ├── features/        # modules: products, cart, auth, user
│   │   ├── shared/          # shared components, pipes, directives
│   │   └── store/           # NgRX actions, reducers, effects, selectors
│   ├── assets/
│   ├── environments/
│   └── index.html
├── angular.json
├── package.json
└── README.md

🧰 Development Setup
Prerequisites

Node.js (v18+)

Angular CLI (npm install -g @angular/cli)

Firebase account (for auth & hosting)

Stripe account (for payment testing)

🔧 Local Development

Clone the repository

git clone https://github.com/ShadowDrake21/ngrx-internet-shop.git
cd ngrx-internet-shop


Install dependencies

npm install


Run the development server

ng serve


Navigate to http://localhost:4200/
.
The app automatically reloads on file changes.

Build the project

ng build


The build artifacts are stored in the dist/ directory.

🧪 Testing
Unit Tests

Run tests with Karma:

ng test

End-to-End Tests

If you have Cypress or another E2E tool configured:

ng e2e

🧭 Quick Start Tutorial

Launch the app (ng serve)

Register or log in (or continue as guest)

Browse products by category or search

Add products to the cart

Proceed to checkout with Stripe

Manage your favourites and profile from the user section

💡 Future Improvements

👑 Admin dashboard for product and order management

🌙 Dark/light theme toggle

🗣️ Multi-language support (i18n)

📱 Progressive Web App (PWA) support

📈 Enhanced analytics and reporting

👨‍💻 Author

Dmytro Krapyvianskyi
📍 Full-stack developer specializing in Angular & Java
🌐 GitHub Profile

📧 Contact: your_email@example.com

🪪 License

This project is licensed for educational and portfolio demonstration purposes.
© 2025 Dmytro Krapyvianskyi. All rights reserved.
