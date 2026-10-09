-- ============================================================
-- ATCHAGA MART - MySQL 8 Database Schema & Sample Data
-- Database: atchaga_mart
-- ============================================================

CREATE DATABASE IF NOT EXISTS atchaga_mart
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE atchaga_mart;

-- ------------------------------------------------------------
-- USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     VARCHAR(500),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PRODUCTS TABLE
-- ------------------------------------------------------------
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
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_price  CHECK (price >= 0),
    CONSTRAINT chk_stock  CHECK (stock >= 0),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 0 AND 5)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDERS TABLE
-- ------------------------------------------------------------
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
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDER_ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(200)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT chk_quantity     CHECK (quantity > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SAMPLE USERS
-- Password for both: admin123 / user123 (BCrypt encoded)
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Admin User', 'admin@atchagamart.com', '$2b$10$94Wqj5AmeY//zq5JtEU76eAUBETljFGi0LelQBjDyHIrtmgoGLtuK', '9876543210', '12, Market Road, Mumbai', 'ADMIN'),
('Demo User', 'user@atchagamart.com', '$2b$10$94Wqj5AmeY//zq5JtEU76eAUBETljFGi0LelQBjDyHIrtmgoGLtuK', '9876501234', '45, Lake View, Bengaluru', 'USER');

-- ------------------------------------------------------------
-- SAMPLE PRODUCTS (36 products across 11 categories)
-- ------------------------------------------------------------
INSERT INTO products (name, description, category, price, stock, image_url, brand, rating) VALUES

-- Electronics
('Samsung 55" 4K Smart TV', 'Crystal 4K UHD with PurColor, Smart Hub, and Alexa built-in. Immersive picture quality for movies and gaming.', 'Electronics', 42999.00, 25, 'https://placehold.co/400x400/0d6efd/ffffff?text=Samsung+TV', 'Samsung', 4.5),
('Sony 1080p Home Theater System', '5.1 channel surround sound with Bluetooth streaming and HDMI ARC support.', 'Electronics', 18999.00, 15, 'https://placehold.co/400x400/6c757d/ffffff?text=Sony+Theater', 'Sony', 4.3),
('Canon EOS 200D Camera', '24.1MP DSLR with Dual Pixel CMOS AF, vari-angle touchscreen, and Full HD video recording.', 'Electronics', 52999.00, 10, 'https://placehold.co/400x400/212529/ffffff?text=Canon+DSLR', 'Canon', 4.6),
('boAt Airdopes 141 Earbuds', 'TWS earbuds with 42H playtime, ENx noise cancellation, low latency mode, and ASAP charge.', 'Electronics', 1299.00, 120, 'https://placehold.co/400x400/d63384/ffffff?text=boAt+Earbuds', 'boAt', 4.1),

-- Mobiles
('iPhone 15 Pro 256GB', 'A17 Pro chip, titanium design, 48MP camera system with 5x Telephoto, and USB-C.', 'Mobiles', 134900.00, 30, 'https://placehold.co/400x400/198754/ffffff?text=iPhone+15+Pro', 'Apple', 4.8),
('Samsung Galaxy S24 Ultra', '200MP camera, Snapdragon 8 Gen 3, built-in S Pen, and 5000mAh battery.', 'Mobiles', 129999.00, 20, 'https://placehold.co/400x400/0d6efd/ffffff?text=Galaxy+S24', 'Samsung', 4.7),
('OnePlus 12 5G', 'Snapdragon 8 Gen 3, 5400mAh battery with 100W SUPERVOOC charging, 6.82" 2K LTPO display.', 'Mobiles', 64999.00, 40, 'https://placehold.co/400x400/dc3545/ffffff?text=OnePlus+12', 'OnePlus', 4.5),
('Redmi Note 13 Pro', '200MP camera with OIS, 120Hz AMOLED display, 5100mAh battery, 67W fast charging.', 'Mobiles', 24999.00, 60, 'https://placehold.co/400x400/fd7e14/ffffff?text=Redmi+Note+13', 'Xiaomi', 4.3),

-- Fashion
('Men''s Slim Fit Cotton Shirt', 'Premium cotton slim-fit formal shirt. Breathable fabric, perfect for office and casual wear.', 'Fashion', 899.00, 200, 'https://placehold.co/400x400/6f42c1/ffffff?text=Cotton+Shirt', 'Allen Solly', 4.2),
('Women''s Floral Print Kurti', 'Elegant A-line kurti with floral print. Comfortable ethnic wear for daily and festive occasions.', 'Fashion', 649.00, 150, 'https://placehold.co/400x400/e83e8c/ffffff?text=Floral+Kurti', 'Biba', 4.4),
('Men''s Casual Denim Jacket', 'Classic blue denim jacket with a modern fit. Durable, stylish, and versatile.', 'Fashion', 1499.00, 80, 'https://placehold.co/400x400/0d6efd/ffffff?text=Denim+Jacket', 'Levi''s', 4.5),
('Women''s Running Tights', 'High-waist stretchable tights with moisture-wicking fabric. Ideal for gym and yoga.', 'Fashion', 799.00, 110, 'https://placehold.co/400x400/20c997/ffffff?text=Running+Tights', 'Nike', 4.3),

-- Computers
('MacBook Air M3 13-inch', 'Apple M3 chip, 8GB RAM, 256GB SSD, 18-hour battery life, stunning Liquid Retina display.', 'Computers', 114900.00, 18, 'https://placehold.co/400x400/212529/ffffff?text=MacBook+Air', 'Apple', 4.8),
('HP Pavilion Gaming Laptop', 'Intel Core i5-13420H, 16GB RAM, 512GB SSD, NVIDIA RTX 3050, 144Hz display.', 'Computers', 72999.00, 22, 'https://placehold.co/400x400/dc3545/ffffff?text=HP+Gaming', 'HP', 4.4),
('Dell XPS 13 Plus', 'Intel Core i7-1360P, 16GB RAM, 512GB SSD, 13.4" OLED touchscreen, ultra-thin design.', 'Computers', 139999.00, 12, 'https://placehold.co/400x400/6c757d/ffffff?text=Dell+XPS+13', 'Dell', 4.6),
('Logitech MX Master 3S Mouse', 'Advanced wireless mouse with ultra-fast scrolling, 8K DPI sensor, and quiet clicks.', 'Computers', 8999.00, 45, 'https://placehold.co/400x400/212529/ffffff?text=MX+Master+3S', 'Logitech', 4.7),

-- Home & Kitchen
('Prestige Induction Cooktop', '1900W induction cooktop with push-button controls, auto shut-off, and Indian menu options.', 'Home & Kitchen', 2499.00, 55, 'https://placehold.co/400x400/fd7e14/ffffff?text=Induction+Cooktop', 'Prestige', 4.2),
('Philips Air Fryer HD9270', 'RapidAir technology with 1400W power. Fry, bake, grill, and roast with little to no oil.', 'Home & Kitchen', 9999.00, 35, 'https://placehold.co/400x400/0d6efd/ffffff?text=Air+Fryer', 'Philips', 4.5),
('Borosil Glass Water Bottle Set', 'Set of 6 leak-proof glass bottles (1L each) with steel lids. BPA-free and eco-friendly.', 'Home & Kitchen', 749.00, 90, 'https://placehold.co/400x400/20c997/ffffff?text=Borosil+Bottles', 'Borosil', 4.3),
('Wakefit Memory Foam Pillow', 'Ergonomic contour pillow with cooling gel memory foam. Supports neck and spine alignment.', 'Home & Kitchen', 1299.00, 70, 'https://placehold.co/400x400/6f42c1/ffffff?text=Foam+Pillow', 'Wakefit', 4.1),

-- Grocery
('India Gate Basmati Rice 5kg', 'Premium aged basmati rice with long grains and rich aroma. Ideal for biryani and pulao.', 'Grocery', 649.00, 150, 'https://placehold.co/400x400/fd7e14/ffffff?text=Basmati+Rice', 'India Gate', 4.4),
('Tata Salt 1kg', 'Iodized salt with essential minerals. Free-flowing, vacuum-evaporated for purity.', 'Grocery', 28.00, 500, 'https://placehold.co/400x400/0d6efd/ffffff?text=Tata+Salt', 'Tata', 4.6),
('Fortune Sunflower Oil 1L', 'Refined sunflower oil rich in Vitamin E. Light, healthy, and suitable for daily cooking.', 'Grocery', 145.00, 200, 'https://placehold.co/400x400/ffc107/212529?text=Sunflower+Oil', 'Fortune', 4.3),
('Cadbury Dairy Milk Silk 150g', 'Smooth and creamy milk chocolate with a silky texture. Perfect for gifting and treats.', 'Grocery', 180.00, 180, 'https://placehold.co/400x400/6f42c1/ffffff?text=Dairy+Milk+Silk', 'Cadbury', 4.7),

-- Books
('Atomic Habits by James Clear', 'A revolutionary guide to building good habits and breaking bad ones. Over 15 million copies sold.', 'Books', 399.00, 100, 'https://placehold.co/400x400/212529/ffffff?text=Atomic+Habits', 'Penguin', 4.8),
('The Psychology of Money', 'Timeless lessons on wealth, greed, and happiness. A modern classic in personal finance.', 'Books', 299.00, 120, 'https://placehold.co/400x400/198754/ffffff?text=Psychology+of+Money', 'Harriman House', 4.7),
('Harry Potter and the Philosopher''s Stone', 'The book that started it all. Follow Harry''s first year at Hogwarts School of Witchcraft and Wizardry.', 'Books', 350.00, 85, 'https://placehold.co/400x400/dc3545/ffffff?text=Harry+Potter+1', 'Bloomsbury', 4.9),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari''s groundbreaking narrative of how Homo sapiens came to dominate the world.', 'Books', 450.00, 65, 'https://placehold.co/400x400/fd7e14/ffffff?text=Sapiens', 'Vintage', 4.6),

-- Sports
('Yonex Badminton Racquet', 'Carbon graphite racquet with isometric head shape. Lightweight and powerful for intermediate players.', 'Sports', 1899.00, 40, 'https://placehold.co/400x400/20c997/ffffff?text=Yonex+Racquet', 'Yonex', 4.4),
('Nivia Football Size 5', 'Machine-stitched PVC football with butyl bladder. Durable for all playing surfaces.', 'Sports', 799.00, 95, 'https://placehold.co/400x400/212529/ffffff?text=Nivia+Football', 'Nivia', 4.2),
('Adidas Running Shoes', 'Cloudfoam cushioned running shoes with breathable mesh upper. Comfortable for daily training.', 'Sports', 3499.00, 50, 'https://placehold.co/400x400/dc3545/ffffff?text=Adidas+Shoes', 'Adidas', 4.5),
('Yoga Mat with Carry Strap', '6mm thick non-slip TPE yoga mat with alignment lines. Includes free carry strap.', 'Sports', 999.00, 75, 'https://placehold.co/400x400/6f42c1/ffffff?text=Yoga+Mat', 'Adidas', 4.3),

-- Toys
('LEGO Classic Creative Bricks 484pc', '484 colorful bricks to build cars, houses, and anything you imagine. Ages 4+.', 'Toys', 2499.00, 60, 'https://placehold.co/400x400/dc3545/ffffff?text=LEGO+Classic', 'LEGO', 4.8),
('Hot Wheels 20-Car Gift Pack', '20 die-cast cars in 1:64 scale with authentic details and Hot Wheels quality.', 'Toys', 1499.00, 80, 'https://placehold.co/400x400/0d6efd/ffffff?text=Hot+Wheels', 'Mattel', 4.6),
('Barbie Dreamhouse Doll', '3-story dollhouse with 70+ accessories, elevator, pool, and slide. Spark imagination!', 'Toys', 12999.00, 25, 'https://placehold.co/400x400/e83e8c/ffffff?text=Barbie+House', 'Mattel', 4.5),
('Remote Control Monster Truck', '4WD RC truck with 2.4GHz control, all-terrain tires, and rechargeable battery.', 'Toys', 1899.00, 45, 'https://placehold.co/400x400/20c997/ffffff?text=RC+Truck', 'Hot Wheels', 4.2),

-- Beauty
('Lakme Absolute Foundation', 'Full-coverage matte foundation with SPF 20. Long-lasting, flawless finish for all skin types.', 'Beauty', 549.00, 90, 'https://placehold.co/400x400/e83e8c/ffffff?text=Lakme+Foundation', 'Lakme', 4.2),
('Mamaearth Vitamin C Face Wash', 'Ayurvedic face wash with Vitamin C and Turmeric. Deep cleanses and brightens skin.', 'Beauty', 299.00, 130, 'https://placehold.co/400x400/20c997/ffffff?text=Mamaearth+Wash', 'Mamaearth', 4.4),
('Maybelline Lash Sensational Mascara', 'Fanning brush with 10 layers of lashes for a full-fan effect. Smudge-proof and long-wear.', 'Beauty', 499.00, 110, 'https://placehold.co/400x400/212529/ffffff?text=Maybelline+Mascara', 'Maybelline', 4.3),
('Himalaya Neem Face Pack', 'Purifying face pack with Neem and Fuller''s Earth. Controls oil and prevents pimples.', 'Beauty', 185.00, 140, 'https://placehold.co/400x400/198754/ffffff?text=Himalaya+Pack', 'Himalaya', 4.1),

-- Accessories
('Fastrack Analog Watch', 'Stainless steel case with leather strap. Water-resistant and stylish for everyday wear.', 'Accessories', 1299.00, 65, 'https://placehold.co/400x400/212529/ffffff?text=Fastrack+Watch', 'Fastrack', 4.2),
('Wildcraft 35L Travel Backpack', 'Water-resistant backpack with padded laptop sleeve, multiple compartments, and rain cover.', 'Accessories', 1499.00, 55, 'https://placehold.co/400x400/fd7e14/ffffff?text=Wildcraft+Bag', 'Wildcraft', 4.4),
('Ray-Ban Aviator Sunglasses', 'Classic aviator with G-15 green lenses and gold frame. 100% UV protection.', 'Accessories', 6999.00, 35, 'https://placehold.co/400x400/6c757d/ffffff?text=Ray-Ban+Aviator', 'Ray-Ban', 4.6),
('JBL Flip 6 Bluetooth Speaker', 'Portable speaker with powerful sound, IP67 waterproof, and 12 hours of playtime.', 'Accessories', 7999.00, 40, 'https://placehold.co/400x400/dc3545/ffffff?text=JBL+Flip+6', 'JBL', 4.5);

-- ------------------------------------------------------------
-- Verify data
-- ------------------------------------------------------------
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_users FROM users;
