package com.atchagamart.controller;

import com.atchagamart.dto.CartItemDTO;
import com.atchagamart.entity.User;
import com.atchagamart.service.CartService;
import com.atchagamart.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getMyCart(Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(cartService.getUserCart(user.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(@RequestBody Map<String, Object> body,
                                                 Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        Long productId = Long.valueOf(body.get("productId").toString());
        Integer quantity = body.get("quantity") != null ? Integer.valueOf(body.get("quantity").toString()) : 1;
        return ResponseEntity.ok(cartService.addToCart(user.getId(), productId, quantity));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Map<String, String>> removeFromCart(@PathVariable Long productId,
                                                              Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        cartService.removeFromCart(user.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<Map<String, String>> clearCart(Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
