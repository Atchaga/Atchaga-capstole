package com.atchagamart.repository;

import com.atchagamart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.orderId = :orderId")
    Optional<Order> findByOrderId(@Param("orderId") String orderId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items ORDER BY o.createdAt DESC")
    List<Order> findAllWithItems();
}
