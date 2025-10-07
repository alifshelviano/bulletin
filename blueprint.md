
# Bulletin Board Application Blueprint

## Overview

This document outlines the plan for creating a full-stack bulletin board application. The backend will be built with Express.js and MongoDB, and the frontend will be a React application.

## Features

*   **User Registration and Login:** Users can create an account and log in.
*   **Create Post:** Logged-in users can create new posts with a title and content.
*   **View Posts:** A list of all posts is displayed on the main page.
*   **View Post Details:** Users can click on a post to see its full content and timestamps.
*   **Edit Post:** The original author of a post can edit its title and content.
*   **Delete Post:** The original author of a post can delete it.

## Backend (Express.js & MongoDB)

*   **Models:**
    *   `User`:
        *   `username`: String, required, unique, min length 3.
        *   `password`: String, required, min length 6.
    *   `Post`:
        *   `title`: String, required, min length 10.
        *   `content`: String, required, min length 20.
        *   `author`: `mongoose.Schema.Types.ObjectId`, ref: 'User'.
        *   `createdAt`: Date, default `Date.now`.
        *   `updatedAt`: Date, default `Date.now`.
*   **API Endpoints:**
    *   `POST /api/auth/register`: Register a new user.
    *   `POST /api/auth/login`: Log in a user and get a JWT token.
    *   `POST /api/posts`: Create a new post (protected).
    *   `GET /api/posts`: Get all posts.
    *   `GET /api/posts/:id`: Get a single post by ID.
    *   `PUT /api/posts/:id`: Update a post by ID (protected, author only).
    *   `DELETE /api/posts/:id`: Delete a post by ID (protected, author only).

## Frontend (React)

*   **Components:**
    *   `App`: Main component, handles routing.
    *   `PostList`: Displays a list of all posts.
    *   `PostDetails`: Displays the details of a single post.
    *   `CreatePost`: A form for creating a new post.
    *   `EditPost`: A form for editing an existing post.
    *   `Login`: A form for user login.
    *   `Register`: A form for user registration.
    *   `Navbar`: Displays navigation links, user info, and logout button.
*   **Routing:**
    *   `/`: Home page, displays `PostList`.
    *   `/posts/:id`: Displays `PostDetails`.
    *   `/create`: Displays `CreatePost`.
    *   `/edit/:id`: Displays `EditPost`.
    *   `/login`: Displays `Login`.
    *   `/register`: Displays `Register`.

## Development Plan

1.  **Backend:**
    1.  Install dependencies: `jsonwebtoken`, `bcrypt`.
    2.  Create the `User` model.
    3.  Create authentication routes for registration and login.
    4.  Implement JWT-based authentication and a middleware for protected routes.
    5.  Update the `Post` model to link to the `User` model.
    6.  Update post routes to handle user authentication and authorization.
2.  **Frontend:**
    1.  Create `Login`, `Register`, and `Navbar` components.
    2.  Update `App.jsx` to include new routes.
    3.  Implement user login and registration logic, storing the JWT token.
    4.  Update other components to work with the authenticated user.
    5.  Conditionally render UI elements based on user authentication status.
    6.  Style the new components.
