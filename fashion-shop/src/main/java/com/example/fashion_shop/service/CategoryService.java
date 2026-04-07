package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.CategoryCreateRequest;
import com.example.fashion_shop.dto.request.CategoryUpdateRequest;
import com.example.fashion_shop.dto.response.CategoryResponse;
import com.example.fashion_shop.entity.Category;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Get all active categories
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Filter only ACTIVE and root categories (parentId is null)
        return categories.stream()
                .filter(c -> c.getStatus() == Category.Status.ACTIVE && c.getParent() == null)
                .map(this::toCategoryResponse)
                .toList();
    }

    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toCategoryResponse(category);
    }

    /**
     * Get category by slug
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toCategoryResponse(category);
    }

    /**
     * Create new category
     */
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        // Validate slug uniqueness
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Category slug already exists");
        }

        // Validate name uniqueness
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        // Check if parent category exists
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .parent(parent)
                .status(Category.Status.ACTIVE)
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created: {} ({})", savedCategory.getName(), savedCategory.getId());
        return toCategoryResponse(savedCategory);
    }

    /**
     * Update category
     */
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Validate slug uniqueness (excluding current category)
        if (!category.getSlug().equals(request.getSlug()) && 
            categoryRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Category slug already exists");
        }

        // Validate name uniqueness (excluding current category)
        if (!category.getName().equals(request.getName()) && 
            categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        // Check if parent category exists
        Category parent = null;
        if (request.getParentId() != null) {
            // Prevent circular references
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setParent(parent);

        if (request.getStatus() != null) {
            try {
                category.setStatus(Category.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status value");
            }
        }

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated: {} ({})", updatedCategory.getName(), updatedCategory.getId());
        return toCategoryResponse(updatedCategory);
    }

    /**
     * Delete category
     */
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Check if category has products
        // Optional: Prevent deletion if category has products
        // if (category.getProducts().size() > 0) {
        //     throw new BadRequestException("Cannot delete category with products");
        // }

        categoryRepository.delete(category);
        log.info("Category deleted: {} ({})", category.getName(), category.getId());
    }

    /**
     * Get categories by parent ID
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByParent(Long parentId) {
        Optional<Category> parent = categoryRepository.findById(parentId);
        if (parent.isEmpty()) {
            throw new ResourceNotFoundException("Parent category not found");
        }
        return parent.get().getChildren().stream()
                .filter(c -> c.getStatus() == Category.Status.ACTIVE)
                .map(this::toCategoryResponse)
                .toList();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .children(category.getChildren().stream()
                        .filter(c -> c.getStatus() == Category.Status.ACTIVE)
                        .map(this::toCategoryResponse)
                        .toList())
                .status(category.getStatus().name())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
