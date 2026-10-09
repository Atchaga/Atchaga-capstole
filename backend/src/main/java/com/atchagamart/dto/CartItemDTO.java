package com.atchagamart.dto;

import com.atchagamart.entity.CartItem;

public class CartItemDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private Double price;
    private Integer quantity;
    private String addedAt;

    public CartItemDTO() {}

    public static CartItemDTO fromEntity(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setImageUrl(item.getProduct().getImageUrl());
        dto.setPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setAddedAt(item.getAddedAt().toString());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getAddedAt() { return addedAt; }
    public void setAddedAt(String addedAt) { this.addedAt = addedAt; }
}
