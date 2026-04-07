package com.example.fashion_shop.repository;

import com.example.fashion_shop.entity.Cart;
import com.example.fashion_shop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserAndStatus(User user, Cart.CartStatus status);

    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.status = 'ACTIVE'")
    Optional<Cart> findActiveCartByUserId(@Param("userId") Long userId);

}
