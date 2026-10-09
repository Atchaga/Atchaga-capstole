package com.atchagamart.service;

import com.atchagamart.dto.ProductDTO;
import com.atchagamart.entity.Product;
import com.atchagamart.exception.ResourceNotFoundException;
import com.atchagamart.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDTO> getAllProducts(String category, String search,
                                           Double minPrice, Double maxPrice, String sort) {
        Sort sortObj = buildSort(sort);
        List<Product> products = productRepository.findFiltered(category, search, minPrice, maxPrice, sortObj);
        return products.stream().map(ProductDTO::fromEntity).collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductDTO.fromEntity(product);
    }

    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    public List<ProductDTO> getSellerProducts(Long sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO addProduct(Product product, Long sellerId) {
        product.setSellerId(sellerId);
        product.setRating(0.0);
        Product saved = productRepository.save(product);
        return ProductDTO.fromEntity(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, Product updates, Long sellerId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (existing.getSellerId() == null || !existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to edit this product");
        }

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getPrice() != null) existing.setPrice(updates.getPrice());
        if (updates.getStock() != null) existing.setStock(updates.getStock());
        if (updates.getBrand() != null) existing.setBrand(updates.getBrand());
        if (updates.getImageUrl() != null) existing.setImageUrl(updates.getImageUrl());

        productRepository.save(existing);
        return ProductDTO.fromEntity(existing);
    }

    @Transactional
    public void deleteProduct(Long id, Long sellerId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (existing.getSellerId() == null || !existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }

        productRepository.delete(existing);
    }

    private Sort buildSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "id");
        }
        return switch (sort.toLowerCase()) {
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.ASC, "id");
        };
    }
}
