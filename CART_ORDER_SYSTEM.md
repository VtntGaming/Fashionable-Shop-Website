# Shopping Cart and Order System Implementation Guide

## Overview
This document describes the implementation of a complete shopping cart and order management system for the Fashion Shop application.

## Features Implemented

### 1. Shopping Cart System

#### Cart Management
- **Create/Auto-Manage Cart**: A cart is automatically created for each user when they first add an item
- **Cart Statuses**: ACTIVE, CHECKED_OUT, ABANDONED
- **Multiple Items**: Support for adding multiple products with different quantities
- **Real-time Total**: Cart total is automatically calculated

#### Cart Operations
- **Add to Cart**: Add products with specified quantity to the cart
- **Update Quantity**: Change the quantity of items already in the cart
- **Remove Item**: Remove specific items from the cart
- **Clear Cart**: Empty the entire cart
- **View Cart**: Retrieve current cart details

### 2. Order System

#### Order Management
- **Create Order**: Generate orders from cart items (checkout)
- **Order Tracking**: Track orders by order ID or unique order code
- **Order Status Management**: PENDING, PAID, SHIPPING, DELIVERED, CANCELLED
- **Payment Methods**: Support for COD (Cash on Delivery) and VNPAY
- **Stock Management**: Automatically update product stock when orders are created
- **Stock Restoration**: Restore stock when orders are cancelled

#### Order Features
- **Order Code Generation**: Unique order codes in format ORD-YYYYMMDD-XXXXXX
- **User Order History**: Retrieve paginated order history for users
- **Order Details**: Complete order information with items, total, and status
- **Order Cancellation**: Cancel orders with stock restoration

## Database Schema

### Carts Table
```sql
CREATE TABLE carts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL (UNIQUE with status),
    total_amount DECIMAL(10,2),
    status ENUM ('ACTIVE', 'CHECKED_OUT', 'ABANDONED'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_add DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL (UNIQUE),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM ('PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'),
    shipping_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method ENUM ('COD', 'VNPAY'),
    voucher_id BIGINT,
    vnp_txn_ref VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## API Endpoints

### Cart Endpoints

#### 1. Get Cart
```
GET /api/cart
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 1,
        "cartId": 1,
        "productId": 10,
        "productName": "Áo Thun Basic Nam",
        "productImage": "https://...",
        "quantity": 2,
        "priceAtAdd": 249000,
        "subtotal": 498000,
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "itemCount": 1,
    "totalAmount": 498000,
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

#### 2. Add to Cart
```
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 10,
  "quantity": 2
}
```
**Response:** Cart response (same as Get Cart)

#### 3. Update Cart Item Quantity
```
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "cartItemId": 1,
  "quantity": 5
}
```
**Response:** Cart response (same as Get Cart)

#### 4. Remove Item from Cart
```
DELETE /api/cart/remove/{cartItemId}
Authorization: Bearer <token>
```
**Response:** Cart response (same as Get Cart)

#### 5. Clear Cart
```
DELETE /api/cart/clear
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": "Cart has been emptied"
}
```

### Order Endpoints

#### 1. Create Order (Checkout)
```
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": "123 Main Street, District 1, Ho Chi Minh City",
  "phone": "0912345678",
  "paymentMethod": "COD"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderCode": "ORD-20240115-ABC123",
    "userId": 1,
    "userEmail": "user@example.com",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "productId": 10,
        "productName": "Áo Thun Basic Nam",
        "productImage": "https://...",
        "quantity": 2,
        "priceAtPurchase": 249000,
        "subtotal": 498000
      }
    ],
    "totalAmount": 498000,
    "status": "PENDING",
    "shippingAddress": "123 Main Street, District 1, Ho Chi Minh City",
    "phone": "0912345678",
    "paymentMethod": "COD",
    "voucherId": null,
    "itemCount": 1,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

#### 2. Get Order Details
```
GET /api/orders/{orderId}
```
**Response:** Order response (same as Create Order)

#### 3. Get Order by Code
```
GET /api/orders/code/{orderCode}
```
**Response:** Order response (same as Create Order)

#### 4. Get User Orders
```
GET /api/orders/my-orders?page=0&size=10
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "orderCode": "ORD-20240115-ABC123",
        "userId": 1,
        "userEmail": "user@example.com",
        "items": [...],
        "totalAmount": 498000,
        "status": "PENDING",
        "shippingAddress": "123 Main Street, District 1, Ho Chi Minh City",
        "phone": "0912345678",
        "paymentMethod": "COD",
        "voucherId": null,
        "itemCount": 1,
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": {
        "empty": false
      },
      "offset": 0,
      "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 1,
    "numberOfElements": 1,
    "size": 10,
    "number": 0,
    "empty": false,
    "first": true,
    "last": true
  }
}
```

#### 5. Update Order Status (Admin)
```
PUT /api/orders/{orderId}/status?status=SHIPPED
```
**Valid Status Values:** PENDING, PAID, SHIPPING, DELIVERED, CANCELLED

**Response:** Order response (same as Create Order)

#### 6. Cancel Order
```
PUT /api/orders/{orderId}/cancel
```
**Response:** Order response (same as Create Order)

## Services

### CartService
Handles all cart-related operations:
- `getOrCreateCart(userId)`: Get or create an active cart for user
- `addToCart(userId, request)`: Add product to cart
- `updateCartItem(userId, request)`: Update item quantity
- `removeFromCart(userId, cartItemId)`: Remove item from cart
- `getCart(userId)`: Get cart details
- `clearCart(userId)`: Clear entire cart
- `markCartAsCheckedOut(cart)`: Mark cart as checked out after order creation

### OrderService
Handles all order-related operations:
- `createOrder(userId, request)`: Create order from cart (checkout)
- `getOrder(orderId)`: Get order by ID
- `getOrderByCode(orderCode)`: Get order by order code
- `getUserOrders(userId, pageable)`: Get user's order history
- `updateOrderStatus(orderId, status)`: Update order status
- `cancelOrder(orderId)`: Cancel order and restore stock
- `generateOrderCode()`: Generate unique order code

## Entities

### Cart Entity
- Manages user's shopping cart
- Has one-to-many relationship with CartItem
- Has many-to-one relationship with User
- Supports multiple statuses (ACTIVE, CHECKED_OUT, ABANDONED)

### CartItem Entity
- Represents individual items in cart
- Stores quantity and price at time of adding
- Has many-to-one relationship with Cart
- Has many-to-one relationship with Product

### Order Entity
- Represents customer order
- Has one-to-many relationship with OrderItem
- Has many-to-one relationship with User
- Supports multiple statuses and payment methods

### OrderItem Entity
- Represents items included in an order
- Stores quantity and price at time of purchase
- Has many-to-one relationship with Order
- Has many-to-one relationship with Product

## Business Logic

### Adding to Cart
1. Verify user and product existence
2. Check if product is active
3. Validate stock availability
4. If product already in cart, increment quantity
5. else create new cart item
6. Update cart total amount

### Updating Quantity
1. Verify cart item belongs to user's cart
2. Validate new quantity against stock
3. Update quantity
4. Recalculate cart total

### Creating Order
1. Validate cart is not empty
2. Verify all items have sufficient stock
3. Create order with unique order code
4. Convert cart items to order items
5. Update product stock (decrement)
6. Mark cart as CHECKED_OUT
7. Clear cart items

### Cancelling Order
1. Validate order is not already delivered
2. Restore product stock (increment)
3. Update order status to CANCELLED

## Error Handling

### Common Error Responses
- **User not found**: 404 ResourceNotFoundException
- **Product not found**: 404 ResourceNotFoundException
- **Cart is empty**: 400 BadRequestException
- **Insufficient stock**: 400 BadRequestException
- **Invalid payment method**: 400 BadRequestException
- **Invalid order status**: 400 BadRequestException
- **Product inactive**: 400 BadRequestException

## Transaction Management

All service methods use `@Transactional` annotation to ensure:
- Data consistency
- Automatic rollback on exceptions
- Proper isolation levels

## Security

- Cart and Order endpoints require authentication
- User can only access their own cart and orders
- Admin endpoints for status updates (to be protected with role-based access)

## Future Enhancements

1. **Voucher/Discount System**: Apply vouchers to orders during checkout
2. **Cart Expiration**: Implement abandoned cart cleanup
3. **Wishlist**: Save products for later purchase
4. **Order Tracking**: Real-time order status notifications
5. **Payment Gateway Integration**: VNPAY integration for online payments
6. **Inventory Synchronization**: Real-time stock updates
7. **Order Analytics**: Order metrics and reports
8. **Cart Recovery**: Send emails for abandoned carts
