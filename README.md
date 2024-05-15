
# Restaurant Management API

This API serves as the backend for a restaurant management system. It provides endpoints for managing food items, user purchases, user feedback, and more.

## Features

- **Authentication**: Secure endpoints using JSON Web Tokens (JWT) for user authentication.
- **CRUD Operations**: Perform CRUD (Create, Read, Update, Delete) operations on food items, user purchases, and feedback.
- **Middleware**: Implements middleware functions for logging requests, verifying JWT tokens, and handling CORS.
- **Error Handling**: Provides error handling for various scenarios to ensure robustness.
- **Secure**: Implements security measures such as HTTP-only cookies and secure HTTPS connections.
- **Scalability**: Designed for scalability and can handle a large number of concurrent requests.

## Requirements

- Node.js
- MongoDB

## Installation

1. Clone the repository:

```bash
git clone repository.git
```

2. Install dependencies:

```bash
cd restaurant-management-api
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

```plaintext
PORT=5000
MONGODB=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_key
```

## Usage

1. Start the server:

```bash
npm start
```

2. The server will be running at `http://localhost:5000` by default.

3. Use an API testing tool like Postman to interact with the endpoints.

## API Endpoints

- **POST /jwt**: Generate JWT token for authentication.
- **POST /logout**: Clear JWT token.
- **GET /topFoods**: Get top-selling food items.
- **GET /foods**: Get all food items.
- **GET /foods/:id**: Get a specific food item by ID.
- **POST /updateFood/:id**: Update a food item by ID.
- **POST /addFood**: Add a new food item.
- **POST /purchase**: Add a purchase record.
- **GET /myPurchase**: Get purchases made by the authenticated user.
- **POST /myPurchase/:id**: Delete a purchase record by ID.
- **GET /feedbacks**: Get all feedback items.
- **POST /feedback**: Add a new feedback item.
- **GET /myAddedFoods**: Get food items added by the authenticated user.
- **POST /myAddedFoods/:id**: Delete a food item added by the authenticated user.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
