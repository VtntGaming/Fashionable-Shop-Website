package com.example.fashion_shop.repository;

import com.example.fashion_shop.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    Page<Voucher> findByStatus(Voucher.VoucherStatus status, Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.startDate <= :now AND v.endDate >= :now")
    Page<Voucher> findActiveVouchers(@Param("now") LocalDateTime now, Pageable pageable);

    boolean existsByCode(String code);
}
