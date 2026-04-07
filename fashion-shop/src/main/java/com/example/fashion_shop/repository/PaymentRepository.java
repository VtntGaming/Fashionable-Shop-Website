package com.example.fashion_shop.repository;

import com.example.fashion_shop.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);

    Optional<Payment> findByIpnRequestId(String ipnRequestId);
}
