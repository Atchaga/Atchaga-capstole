package com.atchagamart.service;

import com.atchagamart.dto.OrderDTO;
import com.atchagamart.dto.OrderRequest;
import com.atchagamart.dto.OrderTrackingDTO;
import com.atchagamart.entity.Order;
import com.atchagamart.entity.OrderItem;
import com.atchagamart.entity.OrderTracking;
import com.atchagamart.entity.Product;
import com.atchagamart.entity.User;
import com.atchagamart.exception.ResourceNotFoundException;
import com.atchagamart.repository.OrderRepository;
import com.atchagamart.repository.OrderTrackingRepository;
import com.atchagamart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final List<String> TRACKING_FLOW = List.of(
            "PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"
    );

    private static final Map<String, String> STATUS_NOTES = Map.of(
            "PLACED", "Your order has been placed successfully",
            "CONFIRMED", "Your order has been confirmed by the seller",
            "SHIPPED", "Your order has been shipped",
            "OUT_FOR_DELIVERY", "Your order is out for delivery",
            "DELIVERED", "Your order has been delivered"
    );

    private final OrderRepository orderRepository;
    private final OrderTrackingRepository orderTrackingRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderTrackingRepository orderTrackingRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderTrackingRepository = orderTrackingRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderDTO placeOrder(User user, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Your cart is empty. Add items before placing an order.");
        }

        Order order = new Order();
        order.setOrderId(generateOrderId());
        order.setUser(user);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("PLACED");

        double total = 0.0;
        List<OrderItem> items = new ArrayList<>();

        for (OrderRequest.ItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for \"" + product.getName()
                        + "\". Only " + product.getStock() + " left.");
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(itemRequest.getQuantity());

            items.add(item);
            total += product.getPrice() * itemRequest.getQuantity();
        }

        order.setTotalAmount(Math.round(total * 100.0) / 100.0);
        order.setItems(items);

        Order savedOrder = orderRepository.save(order);

        // Create initial tracking entry
        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(savedOrder);
        tracking.setStatus("PLACED");
        tracking.setTimestamp(LocalDateTime.now());
        tracking.setNotes(STATUS_NOTES.get("PLACED"));
        orderTrackingRepository.save(tracking);

        return OrderDTO.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(User user, String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view this order");
        }

        return OrderDTO.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public List<OrderTrackingDTO> getOrderTracking(User user, String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view this order");
        }

        return orderTrackingRepository.findByOrderOrderIdOrderByTimestampAsc(orderId)
                .stream()
                .map(OrderTrackingDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderTrackingDTO advanceOrderStatus(User user, String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to modify this order");
        }

        String currentStatus = order.getStatus();
        int currentIndex = TRACKING_FLOW.indexOf(currentStatus);

        if (currentIndex < 0 || currentIndex >= TRACKING_FLOW.size() - 1) {
            throw new RuntimeException("Order is already in final status: " + currentStatus);
        }

        String nextStatus = TRACKING_FLOW.get(currentIndex + 1);
        order.setStatus(nextStatus);
        orderRepository.save(order);

        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.setStatus(nextStatus);
        tracking.setTimestamp(LocalDateTime.now());
        tracking.setNotes(STATUS_NOTES.get(nextStatus));
        OrderTracking saved = orderTrackingRepository.save(tracking);

        return OrderTrackingDTO.fromEntity(saved);
    }

    private String generateOrderId() {
        String timestamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
        int random = new Random().nextInt(10000);
        return "AM" + timestamp + String.format("%04d", random);
    }
}
