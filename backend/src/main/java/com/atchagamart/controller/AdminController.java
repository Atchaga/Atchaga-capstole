package com.atchagamart.controller;

import com.atchagamart.dto.*;
import com.atchagamart.entity.*;
import com.atchagamart.repository.*;
import com.atchagamart.service.AuthService;
import com.atchagamart.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final OrderTrackingRepository orderTrackingRepository;
    private final UserService userService;
    private final AuthService authService;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final JdbcTemplate jdbcTemplate;

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

    // Columns to exclude from database viewer (sensitive data)
    private static final Set<String> EXCLUDED_COLUMNS = Set.of("password", "jwt_secret", "secret");

    public AdminController(OrderRepository orderRepository,
                           OrderTrackingRepository orderTrackingRepository,
                           UserService userService,
                           AuthService authService,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           JdbcTemplate jdbcTemplate) {
        this.orderRepository = orderRepository;
        this.orderTrackingRepository = orderTrackingRepository;
        this.userService = userService;
        this.authService = authService;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ============================================================
    // 1. DASHBOARD SUMMARY
    // ============================================================
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        long totalUsers = userService.countUsers();
        long totalSellers = authService.getAllUsers().stream().filter(u -> "SELLER".equals(u.getRole())).count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        double totalSales = orderRepository.findAll().stream().mapToDouble(Order::getTotalAmount).sum();
        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> !o.getStatus().equals("DELIVERED"))
                .count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalSellers", totalSellers,
                "totalProducts", totalProducts,
                "totalOrders", totalOrders,
                "totalSales", Math.round(totalSales * 100.0) / 100.0,
                "pendingOrders", pendingOrders
        ));
    }

    // ============================================================
    // 2. REGISTERED ACCOUNTS
    // ============================================================
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // ============================================================
    // 3. PRODUCT MANAGEMENT
    // ============================================================
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productRepository.findAll().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (product.getName() != null) existing.setName(product.getName());
        if (product.getDescription() != null) existing.setDescription(product.getDescription());
        if (product.getCategory() != null) existing.setCategory(product.getCategory());
        if (product.getPrice() != null) existing.setPrice(product.getPrice());
        if (product.getStock() != null) existing.setStock(product.getStock());
        if (product.getBrand() != null) existing.setBrand(product.getBrand());
        if (product.getImageUrl() != null) existing.setImageUrl(product.getImageUrl());

        productRepository.save(existing);
        return ResponseEntity.ok(ProductDTO.fromEntity(existing));
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // ============================================================
    // 4. ORDER MANAGEMENT
    // ============================================================
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/orders/{orderId}/status")
    @Transactional
    public ResponseEntity<OrderTrackingDTO> updateOrderStatus(@PathVariable String orderId,
                                                               @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || !TRACKING_FLOW.contains(newStatus)) {
            throw new RuntimeException("Invalid status. Must be one of: " + TRACKING_FLOW);
        }

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setStatus(newStatus);
        orderRepository.save(order);

        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.setStatus(newStatus);
        tracking.setTimestamp(LocalDateTime.now());
        tracking.setNotes(STATUS_NOTES.get(newStatus));
        OrderTracking saved = orderTrackingRepository.save(tracking);

        return ResponseEntity.ok(OrderTrackingDTO.fromEntity(saved));
    }

    @GetMapping("/orders/{orderId}/tracking")
    public ResponseEntity<List<OrderTrackingDTO>> getOrderTracking(@PathVariable String orderId) {
        List<OrderTrackingDTO> tracking = orderTrackingRepository
                .findByOrderOrderIdOrderByTimestampAsc(orderId)
                .stream()
                .map(OrderTrackingDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tracking);
    }

    // ============================================================
    // 5. CART MANAGEMENT
    // ============================================================
    @GetMapping("/carts")
    public ResponseEntity<List<Map<String, Object>>> getAllCarts() {
        List<User> users = authService.getAllUsers().stream()
                .map(u -> {
                    User user = new User();
                    user.setId(u.getId());
                    user.setName(u.getName());
                    user.setEmail(u.getEmail());
                    user.setRole(u.getRole());
                    return user;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> carts = new ArrayList<>();
        for (User user : users) {
            List<CartItemDTO> items = cartItemRepository.findByUserId(user.getId()).stream()
                    .map(CartItemDTO::fromEntity)
                    .collect(Collectors.toList());
            Map<String, Object> cart = new LinkedHashMap<>();
            cart.put("userId", user.getId());
            cart.put("userName", user.getName());
            cart.put("userEmail", user.getEmail());
            cart.put("userRole", user.getRole());
            cart.put("items", items);
            cart.put("itemCount", items.size());
            cart.put("subtotal", items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum());
            carts.add(cart);
        }
        return ResponseEntity.ok(carts);
    }

    @GetMapping("/carts/{userId}")
    public ResponseEntity<List<CartItemDTO>> getUserCart(@PathVariable Long userId) {
        List<CartItemDTO> items = cartItemRepository.findByUserId(userId).stream()
                .map(CartItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    // ============================================================
    // 6. DATABASE VIEWER
    // ============================================================
    @GetMapping("/database/tables")
    public ResponseEntity<List<Map<String, Object>>> getDatabaseTables() {
        List<Map<String, Object>> tables = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' ORDER BY TABLE_NAME"
        );

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> table : tables) {
            String tableName = (String) table.get("TABLE_NAME");

            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
                    tableName
            );

            List<String> columnNames = columns.stream()
                    .map(c -> (String) c.get("COLUMN_NAME"))
                    .collect(Collectors.toList());

            // Get row count
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT FROM (SELECT COUNT(*) AS COUNT FROM " + tableName + ")", Long.class);

            Map<String, Object> tableInfo = new LinkedHashMap<>();
            tableInfo.put("tableName", tableName);
            tableInfo.put("columns", columnNames);
            tableInfo.put("rowCount", count != null ? count : 0);
            result.add(tableInfo);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/database/tables/{tableName}")
    public ResponseEntity<Map<String, Object>> getTableData(@PathVariable String tableName,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        // Validate table name to prevent SQL injection
        if (!tableName.matches("^[a-zA-Z_][a-zA-Z0-9_]*$")) {
            throw new RuntimeException("Invalid table name");
        }

        // Get columns
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
                tableName
        );

        List<String> columnNames = columns.stream()
                .map(c -> (String) c.get("COLUMN_NAME"))
                .filter(col -> !EXCLUDED_COLUMNS.contains(col.toLowerCase()))
                .collect(Collectors.toList());

        // Get total count
        Long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName, Long.class);

        // Get paginated data
        int offset = (page - 1) * size;
        String columnList = String.join(", ", columnNames);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT " + columnList + " FROM " + tableName + " LIMIT ? OFFSET ?",
                size, offset
        );

        // Remove any sensitive data that might have slipped through
        rows.forEach(row -> row.keySet().removeIf(key -> EXCLUDED_COLUMNS.contains(key.toLowerCase())));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("tableName", tableName);
        result.put("columns", columnNames);
        result.put("rows", rows);
        result.put("total", total != null ? total : 0);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", total != null ? (int) Math.ceil((double) total / size) : 0);

        return ResponseEntity.ok(result);
    }
}
