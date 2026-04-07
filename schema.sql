-- Fashion Shop Database Schema
-- Run this script to initialize the database

CREATE DATABASE IF NOT EXISTS fashion_shop;
USE fashion_shop;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    google_id VARCHAR(255) UNIQUE,
    github_id VARCHAR(255) UNIQUE,
    oauth_provider ENUM('EMAIL', 'GOOGLE', 'GITHUB') DEFAULT 'EMAIL',
    reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    parent_id BIGINT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_status (status)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock INT DEFAULT 0,
    category_id BIGINT,
    brand VARCHAR(255),
    image_url VARCHAR(500),
    views INT DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_products_slug (slug),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_price (price),
    INDEX idx_products_name (name)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images_product (product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method ENUM('COD', 'VNPAY') DEFAULT 'COD',
    voucher_id BIGINT,
    vnp_txn_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_code (order_code),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at)
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('PERCENT', 'AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    quantity INT DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    INDEX idx_vouchers_code (code),
    INDEX idx_vouchers_status (status),
    INDEX idx_vouchers_dates (start_date, end_date)
);
-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_wishlists_user (user_id),
    INDEX idx_wishlists_product (product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('VISIBLE', 'HIDDEN') DEFAULT 'VISIBLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_status (status)
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('ACTIVE', 'CHECKED_OUT', 'ABANDONED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_active_cart (user_id, status),
    INDEX idx_carts_user (user_id),
    INDEX idx_carts_status (status)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_add DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('VNPAY', 'COD') NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    vnp_txn_ref VARCHAR(100),
    vnp_response_code VARCHAR(10),
    vnp_response_message TEXT,
    vnp_return_url VARCHAR(500),
    ipn_request_id VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_vnp_ref (vnp_txn_ref)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    file_path VARCHAR(500),
    status ENUM('DRAFT', 'ISSUED', 'PAID', 'CANCELLED') DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY uk_order_invoice (order_id),
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_status (status)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password, full_name, role, status) VALUES
('admin@fashionshop.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Eo3J5Z5UGCJ3Ty', 'Admin User', 'ADMIN', 'ACTIVE');

-- Insert sample categories
INSERT INTO categories (name, slug, description, status) VALUES
('Áo Thun', 'ao-thun', 'Áo thun nam nữ various styles', 'ACTIVE'),
('Áo Sơ Mi', 'ao-so-mi', 'Sơ mi nam nữ cao cấp', 'ACTIVE'),
('Quần Jeans', 'quan-jeans', 'Quần jeans nam nữ', 'ACTIVE'),
('Váy', 'vay', 'Váy nữ thời trang', 'ACTIVE'),
('Phụ Kiện', 'phu-kien', 'Phụ kiện thời trang', 'ACTIVE');

-- Insert sample products
INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, brand, image_url, status) VALUES
('Áo Thun Basic Nam', 'ao-thun-basic-nam', 'Áo thun cotton basic cho nam, thoáng mát, dễ phối', 299000, 249000, 100, 1, 'FashionShop', 'https://placehold.co/400x500?text=Áo+Thun+Nam', 'ACTIVE'),
('Áo Thun Nữ Phối Màu', 'ao-thun-nu-phoi-mau', 'Áo thun nữ phối màu trendy, chất liệu mềm mại', 349000, 299000, 80, 1, 'FashionShop', 'https://placehold.co/400x500?text=Áo+Thun+Nữ', 'ACTIVE'),
('Sơ Mi Hàn Quốc', 'so-mi-han-quoc', 'Sơ mi Hàn Quốc form regular, phong cách công sở', 499000, 399000, 50, 2, 'KStyle', 'https://placehold.co/400x500?text=Sơ+Mi+Hàn', 'ACTIVE'),
('Sơ Mi Trắng Cao Cấp', 'so-mi-trang-cao-cap', 'Sơ mi trắng cao cấp, cotton 100%', 599000, 549000, 40, 2, 'LuxStyle', 'https://placehold.co/400x500?text=Sơ+Mi+Trắng', 'ACTIVE'),
('Quần Jeans Slim Fit', 'quan-jeans-slim-fit', 'Quần jeans slim fit co giãn, thoáng khí', 699000, 599000, 60, 3, 'DenimPro', 'https://placehold.co/400x500?text=Jeans+Slim', 'ACTIVE'),
('Quần Jeans Wide Leg', 'quan-jeans-wide-leg', 'Qu��n jeans wide leg retro style', 749000, 649000, 45, 3, 'DenimPro', 'https://placehold.co/400x500?text=Jeans+Wide', 'ACTIVE'),
('Váy Midi Xếp Ly', 'vay-midi-xep-ly', 'Váy midi xếp ly sang trọng, dễ phối', 899000, 799000, 35, 4, 'LadyStyle', 'https://placehold.co/400x500?text=Váy+Midi', 'ACTIVE'),
('Váy Mini Hoa', 'vay-mini-hoa', 'Váy mini hoa nhí xinh xắn', 649000, 549000, 50, 4, 'LadyStyle', 'https://placehold.co/400x500?text=Váy+Mini', 'ACTIVE'),
('Belt Da Cao Cấp', 'belt-da-cao-cap', 'Belt da cao cấp, phong cách Hàn Quốc', 399000, 349000, 70, 5, 'KStyle', 'https://placehold.co/400x500?text=Belt+Da', 'ACTIVE'),
(' Túi Đeo Chéo Mini', 'tui-deo-cheo-mini', 'Túi đeo chéo mini thời trang', 549000, 499000, 55, 5, 'BagStyle', 'https://placehold.co/400x500?text=Túi+Mini', 'ACTIVE');

-- Insert sample vouchers
INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, max_discount, quantity, start_date, end_date, status) VALUES
('WELCOME10', 'PERCENT', 10, 200000, 50000, 1000, '2024-01-01 00:00:00', '2026-12-31 23:59:59', 'ACTIVE'),
('SUMMER50K', 'AMOUNT', 50000, 300000, NULL, 500, '2024-01-01 00:00:00', '2026-12-31 23:59:59', 'ACTIVE'),
('FLASH20', 'PERCENT', 20, 500000, 100000, 100, '2024-01-01 00:00:00', '2026-06-30 23:59:59', 'ACTIVE');

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://placehold.co/400x500?text=Áo+Thun+Nam+1', TRUE),
(1, 'https://placehold.co/400x500?text=Áo+Thun+Nam+2', FALSE),
(2, 'https://placehold.co/400x500?text=Áo+Thun+Nữ+1', TRUE),
(3, 'https://placehold.co/400x500?text=Sơ+Mi+Hàn+1', TRUE),
(4, 'https://placehold.co/400x500?text=Sơ+Mi+Trắng+1', TRUE),
(5, 'https://placehold.co/400x500?text=Jeans+Slim+1', TRUE),
(6, 'https://placehold.co/400x500?text=Jeans+Wide+1', TRUE),
(7, 'https://placehold.co/400x500?text=Váy+Midi+1', TRUE),
(8, 'https://placehold.co/400x500?text=Váy+Mini+1', TRUE),
(9, 'https://placehold.co/400x500?text=Belt+Da+1', TRUE),
(10, 'https://placehold.co/400x500?text=Túi+Mini+1', TRUE);
