package com.atchagamart.controller;

import com.atchagamart.dto.OrderDTO;
import com.atchagamart.dto.OrderRequest;
import com.atchagamart.dto.OrderTrackingDTO;
import com.atchagamart.entity.User;
import com.atchagamart.service.OrderService;
import com.atchagamart.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(@Valid @RequestBody OrderRequest request,
                                                Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        OrderDTO order = orderService.placeOrder(user, request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(orderService.getMyOrders(user));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable String orderId,
                                             Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(orderService.getOrderById(user, orderId));
    }

    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<List<OrderTrackingDTO>> getOrderTracking(@PathVariable String orderId,
                                                                  Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(orderService.getOrderTracking(user, orderId));
    }

    @PostMapping("/{orderId}/advance")
    public ResponseEntity<OrderTrackingDTO> advanceOrderStatus(@PathVariable String orderId,
                                                               Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(orderService.advanceOrderStatus(user, orderId));
    }
}
