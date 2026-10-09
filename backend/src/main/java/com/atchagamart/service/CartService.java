package com.atchagamart.service;

import com.atchagamart.dto.CartItemDTO;
import com.atchagamart.entity.CartItem;
import com.atchagamart.entity.Product;
import com.atchagamart.entity.User;
import com.atchagamart.repository.CartItemRepository;
import com.atchagamart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CartItemDTO> getUserCart(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(CartItemDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            User user = new User();
            user.setId(userId);
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return CartItemDTO.fromEntity(saved);
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        cartItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
