-- Remove user_id column from cart_items table
-- This column is not needed since user info is accessible through cart -> user relationship

ALTER TABLE cart_items DROP COLUMN IF EXISTS user_id;

-- Verify the change
-- DESCRIBE cart_items;
