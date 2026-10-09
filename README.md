# ATCHAGA MART — Full-Stack E-Commerce Website

**Tagline:** *Shop Smart. Shop More. Easy Shopping.*

A complete, production-style general e-commerce web application (Amazon/Flipkart style) built with **HTML5, CSS3, JavaScript, Bootstrap 5** on the frontend and **Java 17, Spring Boot 3, Maven, JPA, Spring Security, JWT, BCrypt, MySQL 8** on the backend.

---

## Quick Start (Single Command)

> **Prerequisites:** Java 17+, Maven 3.8+, MySQL 8+

### Step 1: Start MySQL and create the database

Make sure MySQL is running, then execute the SQL script:

```bash
mysql -u root -p < database.sql
```

Enter your MySQL password when prompted. This creates the `atchaga_mart` database with all tables and sample data.

### Step 2: Run the application

```bash
cd backend
mvn spring-boot:run
```

### Step 3: Open in browser

```
http://localhost:8080
```

That's it! The entire application — frontend + backend + database — is now running.

---

## Default Login Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | `admin@atchagamart.com` | `admin123` |
| User  | `user@atchagamart.com`  | `admin123` |

You can also register a new account from the Register page.

---

## Project Structure

```
atchaga-mart/
├── README.md                          # This file
├── database.sql                       # MySQL schema + sample data
├── backend/                           # Spring Boot 3 Application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/atchagamart/
│       │   ├── AtchagaMartApplication.java
│       │   ├── config/SecurityConfig.java
│       │   ├── controller/    (5 controllers)
│       │   ├── dto/           (10 DTOs)
│       │   ├── entity/        (4 entities with JPA relationships)
│       │   ├── exception/     (GlobalExceptionHandler)
│       │   ├── repository/    (4 repositories)
│       │   ├── security/      (JWT filter, JwtUtil, UserDetailsServiceImpl)
│       │   └── service/       (4 services)
│       └── resources/
│           ├── application.properties
│           └── static/        # Frontend files (HTML/CSS/JS)
│               ├── home.html, login.html, register.html
│               ├── products.html, product-details.html
│               ├── cart.html, checkout.html, account.html
│               ├── css/style.css
│               └── js/ (8 JavaScript files)
```

---

## How It Works

- **Spring Boot serves everything** — both the REST API (`/api/*`) and the static frontend files
- **Single port** — everything runs on `http://localhost:8080`
- **No separate frontend server needed** — no Live Server, no `python -m http.server`, no Node.js required
- **JWT authentication** — login/register returns a JWT token stored in localStorage; all protected API calls include it as a Bearer token
- **Cart stored in browser** — localStorage-based cart with stock checking

---

## Configuration

Edit `backend/src/main/resources/application.properties` if needed:

```properties
# MySQL credentials (change if different)
spring.datasource.username=root
spring.datasource.password=root

# Server port (default 8080)
server.port=8080

# JWT secret and expiration (24 hours)
atchaga.jwt.secret=atchagaMartJwtSecretKey2026VeryLongAndSecureKeyForHS256Algorithm1234567890
atchaga.jwt.expiration=86400000
```

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| POST   | `/api/auth/register`       | Create new account   |
| POST   | `/api/auth/login`          | Login → returns JWT  |
| POST   | `/api/auth/forgot-password` | Request password reset |
| GET    | `/api/auth/me`             | Current user (JWT)   |

### Products (Public — GET only)

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/products`         | List (filter/sort/search)  |
| GET    | `/api/products/categories` | All categories          |
| GET    | `/api/products/{id}`    | Single product             |

### Orders & Users (JWT Required)

| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | `/api/orders`           | Place order          |
| GET    | `/api/orders/my-orders` | Order history        |
| GET    | `/api/orders/{orderId}` | Order details        |
| GET    | `/api/users/me`         | My profile           |
| PUT    | `/api/users/me`         | Update profile       |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Unable to connect` / `can't connect to server` | Backend not running — start it with `mvn spring-boot:run` |
| `Access Denied` / MySQL auth error | Check `spring.datasource.password` in application.properties |
| `Port 8080 already in use` | Change `server.port` in application.properties |
| `Table doesn't exist` | Re-run `database.sql` in MySQL |
| `Communications link failure` | Make sure MySQL service is running |
| 401 Unauthorized on cart/checkout | Login again — token may have expired |

---

## Technology Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 |
| Backend  | Java 17, Spring Boot 3.2, Spring MVC, Spring Data JPA |
| Security | Spring Security, JWT (JJWT 0.12.5), BCrypt |
| Database | MySQL 8 |
| Build    | Maven |

---

**ATCHAGA MART** — Shop Smart. Shop More. Easy Shopping.
