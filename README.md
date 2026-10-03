# library-platform
A full-stack platform for discovering, comparing, and subscribing to libraries based on location, facilities, pricing, and availability, with dedicated workflows for users and library owners.


# workflow structure

library-platform/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   ├── library/
│   │   │   ├── subscription/
│   │   │   └── auth/
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Libraries.jsx
│   │   │   │   ├── LibraryDetails.jsx
│   │   │   │   └── About.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Subscriptions.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Favorites.jsx
│   │   │   │   └── Profile.jsx
│   │   │   │
│   │   │   ├── owner/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyLibrary.jsx
│   │   │   │   ├── Plans.jsx
│   │   │   │   ├── Subscribers.jsx
│   │   │   │   └── Reviews.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Users.jsx
│   │   │       ├── Libraries.jsx
│   │   │       ├── Reviews.jsx
│   │   │       └── Reports.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── UserLayout.jsx
│   │   │   ├── OwnerLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── libraryService.js
│   │   │   ├── subscriptionService.js
│   │   │   ├── paymentService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── libraryController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── paymentController.js
│   │   │   └── reviewController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── libraryRoutes.js
│   │   │   ├── subscriptionRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── reviewRoutes.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Library.js
│   │   │   ├── Subscription.js
│   │   │   ├── Payment.js
│   │   │   ├── Review.js
│   │   │   └── Favorite.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── libraryService.js
│   │   │   ├── subscriptionService.js
│   │   │   └── paymentService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── validators.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema/
│   │   ├── users.sql
│   │   ├── libraries.sql
│   │   ├── subscriptions.sql
│   │   ├── payments.sql
│   │   ├── reviews.sql
│   │   └── favorites.sql
│   │
│   ├── seed/
│   │   └── seed.sql
│   │
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── future-ai.md
│
├── .gitignore
├── README.md
└── package.json