package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.ProductCreateRequest;
import com.example.fashion_shop.dto.request.ProductFilterRequest;
import com.example.fashion_shop.dto.request.ProductUpdateRequest;
import com.example.fashion_shop.dto.response.PagedResponse;
import com.example.fashion_shop.dto.response.ProductResponse;
import com.example.fashion_shop.entity.Category;
import com.example.fashion_shop.entity.Product;
import com.example.fashion_shop.entity.ProductImage;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.CategoryRepository;
import com.example.fashion_shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(ProductFilterRequest filter) {
        Sort sort = buildSort(filter.getSortBy(), filter.getSortDir());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> page = productRepository.findWithFilters(
                filter.getCategoryId(),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getKeyword(),
                pageable);

        return toPagedResponse(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsForUser(ProductFilterRequest filter) {
        filter.setSize(Math.min(filter.getSize(), 24));
        return getProducts(filter);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return ProductResponse.fromEntity(product, true);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductResponse.fromEntity(product, true);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsAdmin(ProductFilterRequest filter) {
        Sort sort = buildSort(filter.getSortBy(), filter.getSortDir());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> page;
        if (filter.getCategoryId() != null) {
            page = productRepository.findByCategoryIdAndStatus(
                    filter.getCategoryId(), Product.Status.ACTIVE, pageable);
        } else {
            page = productRepository.findByStatus(Product.Status.ACTIVE, pageable);
        }

        return toPagedResponse(page);
    }

    public ProductResponse createProduct(ProductCreateRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Product with slug '" + request.getSlug() + "' already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .status(Product.Status.ACTIVE)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getAdditionalImages() != null && !request.getAdditionalImages().isEmpty()) {
            for (String imgUrl : request.getAdditionalImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgUrl)
                        .isPrimary(false)
                        .build();
                product.getImages().add(image);
            }
        }

        product = productRepository.save(product);
        log.info("Created product: {} (id={})", product.getName(), product.getId());

        return ProductResponse.fromEntity(product, true);
    }

    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) {
            if (!product.getSlug().equals(request.getSlug()) &&
                productRepository.existsBySlug(request.getSlug())) {
                throw new BadRequestException("Product with slug '" + request.getSlug() + "' already exists");
            }
            product.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getSalePrice() != null) product.setSalePrice(request.getSalePrice());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) product.setStatus(request.getStatus());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getAdditionalImages() != null) {
            product.getImages().clear();
            for (String imgUrl : request.getAdditionalImages()) {
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .imageUrl(imgUrl)
                        .isPrimary(false)
                        .build();
                product.getImages().add(image);
            }
        }

        product = productRepository.save(product);
        log.info("Updated product: {} (id={})", product.getName(), product.getId());

        return ProductResponse.fromEntity(product, true);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product id={}", id);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String query, int page, int size) {
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .keyword(query)
                .page(page)
                .size(size)
                .build();
        return getProductsForUser(filter);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "views"));
        Page<Product> pageResult = productRepository.findByStatus(Product.Status.ACTIVE, pageable);
        return toPagedResponse(pageResult);
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String field = switch (sortBy != null ? sortBy.toLowerCase() : "") {
            case "price" -> "price";
            case "name" -> "name";
            case "created" -> "createdAt";
            case "views" -> "views";
            default -> "createdAt";
        };
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }

    private PagedResponse<ProductResponse> toPagedResponse(Page<Product> page) {
        return PagedResponse.of(
                page.getContent().stream()
                        .map(p -> ProductResponse.fromEntity(p, true))
                        .toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
