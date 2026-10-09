package com.atchagamart.service;

import com.atchagamart.dto.OrderDTO;
import com.atchagamart.entity.Order;
import com.atchagamart.entity.Product;
import com.atchagamart.entity.User;
import com.atchagamart.repository.OrderRepository;
import com.atchagamart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SellerService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public SellerService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSellerDashboard(User user) {
        List<Product> myProducts = productRepository.findBySellerId(user.getId());
        List<Order> allOrders = orderRepository.findAllWithItems();

        long totalOrders = allOrders.size();
        long placed = allOrders.stream().filter(o -> o.getStatus().equals("PLACED")).count();
        long confirmed = allOrders.stream().filter(o -> o.getStatus().equals("CONFIRMED")).count();
        long shipped = allOrders.stream().filter(o -> o.getStatus().equals("SHIPPED")).count();
        long delivered = allOrders.stream().filter(o -> o.getStatus().equals("DELIVERED")).count();
        double totalRevenue = allOrders.stream().mapToDouble(Order::getTotalAmount).sum();
        long lowStock = myProducts.stream().filter(p -> p.getStock() <= 10).count();
        long outOfStock = myProducts.stream().filter(p -> p.getStock() == 0).count();

        return Map.of(
                "totalOrders", totalOrders,
                "placed", placed,
                "confirmed", confirmed,
                "shipped", shipped,
                "delivered", delivered,
                "totalRevenue", totalRevenue,
                "myProductCount", myProducts.size(),
                "lowStock", lowStock,
                "outOfStock", outOfStock
        );
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getSellerOrders() {
        return orderRepository.findAllWithItems().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
