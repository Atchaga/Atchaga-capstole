package com.atchagamart.controller;

import com.atchagamart.dto.OrderDTO;
import com.atchagamart.dto.ProductDTO;
import com.atchagamart.entity.Product;
import com.atchagamart.entity.User;
import com.atchagamart.service.ProductService;
import com.atchagamart.service.SellerService;
import com.atchagamart.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
public class SellerController {

    private final UserService userService;
    private final ProductService productService;
    private final SellerService sellerService;

    public SellerController(UserService userService,
                           ProductService productService,
                           SellerService sellerService) {
        this.userService = userService;
        this.productService = productService;
        this.sellerService = sellerService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(sellerService.getSellerDashboard(user));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getSellerOrders() {
        return ResponseEntity.ok(sellerService.getSellerOrders());
    }

    // ============ SELLER PRODUCT MANAGEMENT ============

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getMyProducts(Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(productService.getSellerProducts(user.getId()));
    }

    @PostMapping("/products")
    @Transactional
    public ResponseEntity<ProductDTO> addProduct(@RequestBody Product product, Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        ProductDTO saved = productService.addProduct(product, user.getId());
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody Product product, Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        return ResponseEntity.ok(productService.updateProduct(id, product, user.getId()));
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id, Authentication authentication) {
        User user = userService.getUserEntity(authentication.getName());
        productService.deleteProduct(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}
