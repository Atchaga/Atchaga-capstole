-- ============================================================
-- ATCHAGA MART - H2 Compatible Schema
-- Auto-executed by Spring Boot on startup
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     VARCHAR(500),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    category    VARCHAR(100) NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT          NOT NULL DEFAULT 0,
    image_url   VARCHAR(500),
    brand       VARCHAR(100),
    rating      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    seller_id   BIGINT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id         VARCHAR(50)   NOT NULL UNIQUE,
    user_id          BIGINT        NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    status           VARCHAR(30)   NOT NULL DEFAULT 'PLACED',
    customer_name    VARCHAR(100)  NOT NULL,
    customer_email   VARCHAR(150)  NOT NULL,
    customer_phone   VARCHAR(20),
    shipping_address VARCHAR(1000) NOT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(200)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS order_tracking (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT       NOT NULL,
    status     VARCHAR(30)  NOT NULL,
    timestamp  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    notes      VARCHAR(500),
    CONSTRAINT fk_tracking_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    product_id BIGINT       NOT NULL,
    quantity   INT          NOT NULL DEFAULT 1,
    added_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
