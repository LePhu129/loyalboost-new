# LoyalBoost - Customer Loyalty Management System

LoyalBoost is a modern customer loyalty management system that helps businesses reward and retain their customers through a points-based system.

## Features

- User authentication and authorization
- Points tracking and tier-based membership system
- Reward catalog and redemption
- Transaction history
- Profile management
- Analytics and reporting (coming soon)

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for UI components
- Redux Toolkit for state management
- React Router for navigation
- Formik and Yup for form handling and validation
- Axios for API requests
- Vite for build tooling

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Express middleware for validation and authorization

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (v4.4 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/loyalboost-new.git
cd loyalboost-new
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd src/client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loyalboost
JWT_SECRET=your_jwt_secret_here
```

5. Start the development servers:

Backend:
```bash
npm run dev
```

Frontend:
```bash
cd src/client
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Project Structure

```
loyalboost-new/
├── src/
│   ├── client/              # Frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── features/    # Redux slices and related logic
│   │   │   ├── pages/       # Page components
│   │   │   ├── services/    # API services
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── utils/       # Utility functions
│   │   └── public/          # Static assets
│   ├── controllers/         # Backend route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── middleware/         # Express middleware
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 