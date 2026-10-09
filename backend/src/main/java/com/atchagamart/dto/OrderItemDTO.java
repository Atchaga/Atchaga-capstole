package com.atchagamart.dto;

import com.atchagamart.entity.OrderItem;

public class OrderItemDTO {

    private Long id;
    private String productName;
    private Double price;
    private Integer quantity;

    public OrderItemDTO() {}

    public OrderItemDTO(Long id, String productName, Double price, Integer quantity) {
        this.id = id;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
    }

    public static OrderItemDTO fromEntity(OrderItem item) {
        return new OrderItemDTO(item.getId(), item.getProductName(), item.getPrice(), item.getQuantity());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
