package com.atchagamart.dto;

import com.atchagamart.entity.Product;

import java.time.LocalDateTime;

public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private String brand;
    private Double rating;
    private Long sellerId;
    private LocalDateTime createdAt;

    public ProductDTO() {}

    public ProductDTO(Long id, String name, String description, String category, Double price, Integer stock, String imageUrl, String brand, Double rating, Long sellerId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.brand = brand;
        this.rating = rating;
        this.sellerId = sellerId;
        this.createdAt = createdAt;
    }

    public static ProductDTO fromEntity(Product p) {
        return new ProductDTO(
                p.getId(), p.getName(), p.getDescription(), p.getCategory(),
                p.getPrice(), p.getStock(), p.getImageUrl(), p.getBrand(),
                p.getRating(), p.getSellerId(), p.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
