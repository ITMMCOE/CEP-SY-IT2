# CampusFinds - Lost & Found Web Application

This is a full-stack Lost & Found web application for a college campus, built with Node.js, Express, and SQLite.

## Features

-   **User Authentication**: Secure registration and login for students and admins.
-   **Role-Based Access**: Separate dashboards and permissions for students and administrators.
-   **Item Posting**: Users can post lost or found items with details and images.
-   **Image Uploads**: Handles image uploads with file size and type validation.
-   **Dynamic Filtering**: Search and filter items by keyword, category, and status.
-   **Admin Management**: Admins can view all items, manage posts, and mark items as resolved.

## Technology Stack

-   **Backend**: Node.js, Express.js
-   **Database**: SQLite (file-based)
-   **Authentication**: `express-session` (cookie-based), `bcrypt` (password hashing)
-   **File Uploads**: `multer`
-   **Frontend**: Static HTML, JavaScript (ES6+)
-   **Styling**: Tailwind CSS (via CDN)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or newer recommended)
-   npm (comes with Node.js)

### Installation & Running the Application

1.  **Clone the repository or copy the files** into a new directory named `campusfinds`.

2.  **Navigate to the project directory:**
    ```bash
    cd campusfinds
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install Express, SQLite3, bcrypt, and other required packages.

4.  **Start the server:**
    ```bash
    npm start
    ```
    For development, you can use `nodemon` for automatic server restarts on file changes:
    ```bash
    npm install --save-dev nodemon
    npx nodemon server.js
    ```

5.  **Access the application:**
    Open your web browser and go to `http://localhost:3000`.

### Database and Uploads

-   The SQLite database file `database.db` will be created automatically in the root directory on the first run.
-   The `uploads/` directory for item images will also be created automatically.

### Default Admin Credentials

An administrator account is seeded automatically on the first run.

-   **Email**: `admin@campus.local`
-   **Password**: `adminpass`

## Production Considerations

-   **Session Secret**: The default `secret` in `express-session` is for development only. In a production environment, this should be replaced with a long, random, and securely stored string (e.g., from an environment variable).
-   **HTTPS**: For production, you should run the application behind a reverse proxy (like Nginx) and enable HTTPS to secure data in transit, especially for logins. Set `cookie: { secure: true }` in the session configuration when using HTTPS.
-   **Database**: While SQLite is excellent for development and small-scale applications, a more robust database like PostgreSQL or MySQL might be preferable for larger, high-concurrency applications.
-   **Error Handling**: The current error handling is basic. A production application should have more robust logging and error handling middleware.
-   **Security**: Always keep dependencies updated (`npm audit fix`). Implement rate limiting on login/register endpoints to prevent brute-force attacks.