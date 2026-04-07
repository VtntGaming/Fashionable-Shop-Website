package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.request.VoucherCreateRequest;
import com.example.fashion_shop.dto.request.VoucherUpdateRequest;
import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.VoucherResponse;
import com.example.fashion_shop.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    /**
     * Get active vouchers (public)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getActiveVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherResponse> vouchers = voucherService.getActiveVouchers(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<VoucherResponse>>builder()
                .success(true)
                .message("Active vouchers retrieved successfully")
                .data(vouchers)
                .build());
    }

    /**
     * Get voucher by code
     */
    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherByCode(@PathVariable String code) {
        VoucherResponse voucher = voucherService.getVoucherByCode(code);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .success(true)
                .message("Voucher retrieved successfully")
                .data(voucher)
                .build());
    }

    /**
     * Validate voucher and get discount
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<BigDecimal>> validateVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        BigDecimal discount = voucherService.validateAndGetDiscount(code, orderAmount);
        return ResponseEntity.ok(ApiResponse.<BigDecimal>builder()
                .success(true)
                .message("Voucher is valid")
                .data(discount)
                .build());
    }

    /**
     * Create voucher (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(
            @Valid @RequestBody VoucherCreateRequest request) {
        VoucherResponse voucher = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<VoucherResponse>builder()
                        .success(true)
                        .message("Voucher created successfully")
                        .data(voucher)
                        .build());
    }

    /**
     * Update voucher (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherUpdateRequest request) {
        VoucherResponse voucher = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .success(true)
                .message("Voucher updated successfully")
                .data(voucher)
                .build());
    }

    /**
     * Delete voucher (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Voucher deleted successfully")
                .data("Voucher has been removed")
                .build());
    }

    /**
     * Get all vouchers (Admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getAllVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherResponse> vouchers = voucherService.getAllVouchers(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<VoucherResponse>>builder()
                .success(true)
                .message("All vouchers retrieved successfully")
                .data(vouchers)
                .build());
    }
}
