package com.atchagamart.dto;

import com.atchagamart.entity.OrderTracking;

import java.time.LocalDateTime;

public class OrderTrackingDTO {

    private String status;
    private LocalDateTime timestamp;
    private String notes;

    public OrderTrackingDTO() {}

    public OrderTrackingDTO(String status, LocalDateTime timestamp, String notes) {
        this.status = status;
        this.timestamp = timestamp;
        this.notes = notes;
    }

    public static OrderTrackingDTO fromEntity(OrderTracking tracking) {
        return new OrderTrackingDTO(
                tracking.getStatus(),
                tracking.getTimestamp(),
                tracking.getNotes()
        );
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
