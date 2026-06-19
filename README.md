# Amunet AI Backend

This directory contains the Express.js backend for the Amunet AI application.

## Setup

1.  Navigate into this directory:
    ```sh
    cd backend
    ```

2.  Install the required dependencies:
    ```sh
    npm install
    ```

3.  Create a `.env` file in this directory and add the necessary environment variables (see below).

## Environment Variables

Your `.env` file should contain the following keys:

-   `API_KEY`: Your Google Gemini API Key. This is required for all AI-related functionality.
-   `PORT`: The port for the server to run on. Defaults to `3001` if not specified.

Example `.env` file:
```
API_KEY=AIzaSyDscZJkYafHa0DJr5thSD8Ur0Wiskdxq_0
PORT=3001
```

## Running the Server

To start the development server, run:

```sh
npm run dev
```

The server will start on `http://localhost:3001` (or your specified `PORT`) and will automatically restart when you make changes to the source code.

## Authentication

This backend includes a mock authentication and authorization system for demonstration purposes. To access protected routes, you must include an `Authorization` header in your request.

-   **Client Access:** For client-level routes (e.g., `/api/client-dashboard`), use the following header:
    ```
    Authorization: Bearer client-token
    ```
-   **Admin Access:** For admin-level routes (e.g., `/api/admin-dashboard`, `/api/admin/impersonate`), use the following header:
    ```
    Authorization: Bearer admin-token
    ```

Any other value or a missing header will result in a `401 Unauthorized` or `403 Forbidden` error.