package com.example.hebekery.service;

import com.example.hebekery.dto.CategoryResponse;
import com.example.hebekery.dto.request.CategoryRequest;
import com.example.hebekery.model.Category;
import com.example.hebekery.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public Page<CategoryResponse> getAllCategories(String keyword, Pageable pageable) {
        Page<Category> page;
        if (keyword != null && !keyword.isBlank()) {
            page = categoryRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            page = categoryRepository.findAll(pageable);
        }
        return page.map(CategoryResponse::fromEntity);
    }

    public CategoryResponse getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(CategoryResponse::fromEntity)
                .orElse(null);
    }

    public Category getCategoryEntityById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public Category getCategoryEntityByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return categoryRepository.findByNameIgnoreCase(name.trim()).orElse(null);
    }

    public Category getCategoryEntityBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return null;
        }
        return categoryRepository.findBySlug(slug.trim()).orElse(null);
    }

    @Transactional
    public Category getOrCreateCategoryByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String trimmed = name.trim();
        return categoryRepository.findByNameIgnoreCase(trimmed)
                .orElseGet(() -> {
                    String slug = generateSlug(trimmed);
                    Category newCat = new Category(trimmed, slug, trimmed);
                    return categoryRepository.save(newCat);
                });
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + name);
        }

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? generateSlug(request.getSlug().trim())
                : generateSlug(name);

        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setActive(request.getActive() == null || request.getActive());

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục với ID: " + id));

        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + name);
        }

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? generateSlug(request.getSlug().trim())
                : generateSlug(name);

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục với ID: " + id));
        categoryRepository.delete(category);
    }

    public static String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        slug = slug.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
        return slug.replaceAll("^-|-$", "");
    }
}
