package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.VoucherCreateRequest;
import com.example.fashion_shop.dto.request.VoucherUpdateRequest;
import com.example.fashion_shop.dto.response.VoucherResponse;
import com.example.fashion_shop.entity.Voucher;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoucherService {

    private final VoucherRepository voucherRepository;

    /**
     * Get all active vouchers (public)
     */
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getActiveVouchers(Pageable pageable) {
        return voucherRepository.findActiveVouchers(LocalDateTime.now(), pageable)
                .map(this::toVoucherResponse);
    }

    /**
     * Get voucher by code
     */
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        return toVoucherResponse(voucher);
    }

    /**
     * Validate and get discount amount
     */
    @Transactional(readOnly = true)
    public BigDecimal validateAndGetDiscount(String code, BigDecimal orderAmount) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid voucher code"));

        if (!voucher.canBeUsed(orderAmount)) {
            throw new BadRequestException("Voucher is not applicable for this order");
        }

        return voucher.calculateDiscount(orderAmount);
    }

    /**
     * Create voucher (Admin)
     */
    public VoucherResponse createVoucher(VoucherCreateRequest request) {
        // Validate code uniqueness
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Voucher code already exists");
        }

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        // Validate discount type
        Voucher.DiscountType discountType;
        try {
            discountType = Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid discount type. Must be PERCENT or AMOUNT");
        }

        // Set defaults
        BigDecimal minOrderValue = request.getMinOrderValue() != null ? 
                request.getMinOrderValue() : BigDecimal.ZERO;
        Integer quantity = request.getQuantity() != null ? 
                request.getQuantity() : 0;

        Voucher voucher = Voucher.builder()
                .code(request.getCode().toUpperCase())
                .discountType(discountType)
                .discountValue(request.getDiscountValue())
                .minOrderValue(minOrderValue)
                .maxDiscount(request.getMaxDiscount())
                .quantity(quantity)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(Voucher.VoucherStatus.ACTIVE)
                .build();

        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Voucher created: {}", savedVoucher.getCode());
        return toVoucherResponse(savedVoucher);
    }

    /**
     * Update voucher (Admin)
     */
    public VoucherResponse updateVoucher(Long id, VoucherUpdateRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));

        // Validate code uniqueness if changed
        if (request.getCode() != null && !request.getCode().equals(voucher.getCode())) {
            if (voucherRepository.existsByCode(request.getCode())) {
                throw new BadRequestException("Voucher code already exists");
            }
            voucher.setCode(request.getCode().toUpperCase());
        }

        if (request.getDiscountType() != null) {
            try {
                voucher.setDiscountType(Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid discount type. Must be PERCENT or AMOUNT");
            }
        }

        if (request.getDiscountValue() != null) {
            voucher.setDiscountValue(request.getDiscountValue());
        }

        if (request.getMinOrderValue() != null) {
            voucher.setMinOrderValue(request.getMinOrderValue());
        }

        if (request.getMaxDiscount() != null) {
            voucher.setMaxDiscount(request.getMaxDiscount());
        }

        if (request.getQuantity() != null) {
            voucher.setQuantity(request.getQuantity());
        }

        if (request.getStartDate() != null) {
            voucher.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            // Validate dates
            if (request.getEndDate().isBefore(request.getStartDate() != null ? 
                    request.getStartDate() : voucher.getStartDate())) {
                throw new BadRequestException("End date must be after start date");
            }
            voucher.setEndDate(request.getEndDate());
        }

        if (request.getStatus() != null) {
            try {
                voucher.setStatus(Voucher.VoucherStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status. Must be ACTIVE or INACTIVE");
            }
        }

        Voucher updatedVoucher = voucherRepository.save(voucher);
        log.info("Voucher updated: {}", updatedVoucher.getCode());
        return toVoucherResponse(updatedVoucher);
    }

    /**
     * Delete voucher (Admin)
     */
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));

        voucherRepository.delete(voucher);
        log.info("Voucher deleted: {}", voucher.getCode());
    }

    /**
     * Get all vouchers (Admin)
     */
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable)
                .map(this::toVoucherResponse);
    }

    /**
     * Use voucher (decrement quantity)
     */
    public void useVoucher(String code) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid voucher code"));

        voucher.decrementQuantity();
        voucherRepository.save(voucher);
        log.info("Voucher used: {}", code);
    }

    private VoucherResponse toVoucherResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountType(voucher.getDiscountType().name())
                .discountValue(voucher.getDiscountValue())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscount(voucher.getMaxDiscount())
                .quantity(voucher.getQuantity())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .status(voucher.getStatus().name())
                .isValid(voucher.isValid())
                .createdAt(voucher.getCreatedAt())
                .build();
    }
}
