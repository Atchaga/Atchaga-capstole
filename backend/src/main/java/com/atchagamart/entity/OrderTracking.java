package com.atchagamart.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_tracking")
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 500)
    private String notes;

    public OrderTracking() {}

    public OrderTracking(Long id, Order order, String status, LocalDateTime timestamp, String notes) {
        this.id = id;
        this.order = order;
        this.status = status;
        this.timestamp = timestamp;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
