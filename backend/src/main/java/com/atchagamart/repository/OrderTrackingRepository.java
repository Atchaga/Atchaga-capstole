package com.atchagamart.repository;

import com.atchagamart.entity.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {

    List<OrderTracking> findByOrderIdOrderByTimestampAsc(Long orderId);

    List<OrderTracking> findByOrderOrderIdOrderByTimestampAsc(String orderId);
}
