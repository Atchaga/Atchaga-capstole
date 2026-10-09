package com.atchagamart.controller;

import com.atchagamart.dto.OrderDTO;
import com.atchagamart.entity.Order;
import com.atchagamart.entity.Product;
import com.atchagamart.entity.User;
import com.atchagamart.repository.OrderRepository;
import com.atchagamart.repository.ProductRepository;
import com.atchagamart.service.OrderService;
import com.atchagamart.service.UserService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final UserService userService;

    public ChatbotController(ProductRepository productRepository,
                            OrderRepository orderRepository,
                            OrderService orderService,
                            UserService userService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> body,
                                                     Authentication authentication) {
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.ok(Map.of("reply", "Please type a question about our products or shopping."));
        }

        try {
            String reply = generateReply(message, authentication);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("reply",
                    "I'm sorry, I had trouble processing that. Please try again."));
        }
    }

    private String generateReply(String message, Authentication authentication) {
        String msg = message.toLowerCase().trim();

        // Greeting
        if (msg.matches(".*\\b(hi|hello|hey|good morning|good afternoon|good evening)\\b.*")) {
            return "Hello! Welcome to ATCHAGA MART. I'm your shopping assistant. I can help you with:\n" +
                   "- Product search (e.g., 'Show me laptops')\n" +
                   "- Prices & availability\n" +
                   "- Cart & checkout help\n" +
                   "- Order tracking\n" +
                   "What would you like to know?";
        }

        // Product search by name/keyword
        if (msg.contains("show") || msg.contains("find") || msg.contains("search") ||
            msg.contains("looking for") || msg.contains("want") || msg.contains("need") ||
            msg.contains("price of") || msg.contains("cost of") || msg.contains("how much")) {

            String keyword = extractKeyword(msg);
            if (keyword != null) {
                String keywordLower = keyword.toLowerCase();
                // Search by name and also by category (handle singular/plural)
                List<Product> matches = productRepository
                        .findFiltered(null, keyword, null, null, Sort.by("id"))
                        .stream()
                        .filter(p -> p.getName().toLowerCase().contains(keywordLower) ||
                                     p.getCategory().toLowerCase().contains(keywordLower) ||
                                     p.getCategory().toLowerCase().contains(keywordLower + "s") ||
                                     (keywordLower + "s").contains(p.getCategory().toLowerCase()) ||
                                     (p.getBrand() != null && p.getBrand().toLowerCase().contains(keywordLower)) ||
                                     (p.getDescription() != null && p.getDescription().toLowerCase().contains(keywordLower)))
                        .limit(5)
                        .collect(Collectors.toList());

                // If no name matches, try category search (handles singular/plural)
                if (matches.isEmpty()) {
                    matches = productRepository
                            .findByCategoryContainingIgnoreCase(keyword, Sort.by("id"));
                    if (matches.isEmpty()) {
                        matches = productRepository
                                .findByCategoryContainingIgnoreCase(keyword + "s", Sort.by("id"));
                    }
                }

                if (matches.isEmpty()) {
                    return "I couldn't find any products matching '" + keyword + "'. " +
                           "Try searching for categories like Electronics, Mobiles, Fashion, Books, etc. " +
                           "Or browse all products on our Products page.";
                }

                StringBuilder sb = new StringBuilder("I found " + matches.size() + " product(s) matching '" + keyword + "':\n\n");
                for (Product p : matches) {
                    String stock = p.getStock() == 0 ? "Out of Stock" :
                                  p.getStock() <= 10 ? "Only " + p.getStock() + " left!" : "In Stock";
                    sb.append("• ").append(p.getName()).append("\n")
                      .append("  Brand: ").append(p.getBrand() != null ? p.getBrand() : "N/A").append(" | ")
                      .append("Category: ").append(p.getCategory()).append("\n")
                      .append("  Price: ₹").append(String.format("%,.2f", p.getPrice())).append(" | ")
                      .append("Rating: ").append(String.format("%.1f", p.getRating())).append("/5 | ")
                      .append(stock).append("\n");
                    if (p.getDescription() != null && !p.getDescription().isBlank()) {
                        sb.append("  ").append(p.getDescription(), 0, Math.min(120, p.getDescription().length())).append("...\n");
                    }
                    sb.append("\n");
                }
                sb.append("You can add any of these to your cart. Would you like help with anything else?");
                return sb.toString();
            }
        }

        // Category browsing
        if (msg.contains("categor") || msg.contains("what do you sell") || msg.contains("what products")) {
            List<String> categories = productRepository.findDistinctCategories();
            return "We have products in the following categories:\n" +
                   String.join(", ", categories) + "\n\n" +
                   "You can ask me about any category, e.g., 'Show me Electronics' or 'What books do you have?'";
        }

        // Price range query
        Pattern pricePattern = Pattern.compile("(?:under|below|less than|cheaper than|budget)\\s*(?:₹|rs|inr)?\\s*(\\d+)");
        Matcher priceMatcher = pricePattern.matcher(msg);
        if (priceMatcher.find()) {
            double maxPrice = Double.parseDouble(priceMatcher.group(1));
            List<Product> matches = productRepository
                    .findFiltered(null, null, null, maxPrice, Sort.by("id"))
                    .stream()
                    .filter(p -> p.getPrice() <= maxPrice)
                    .limit(5)
                    .collect(Collectors.toList());

            if (matches.isEmpty()) {
                return "I couldn't find any products under ₹" + String.format("%,.0f", maxPrice) +
                       ". Try increasing your budget or browse all products.";
            }

            StringBuilder sb = new StringBuilder("Here are products under ₹" + String.format("%,.0f", maxPrice) + ":\n\n");
            for (Product p : matches) {
                sb.append("• ").append(p.getName()).append(" — ₹").append(String.format("%,.2f", p.getPrice()))
                  .append(" (").append(p.getCategory()).append(")\n");
            }
            return sb.toString();
        }

        // Stock availability
        if (msg.contains("stock") || msg.contains("available") || msg.contains("availability") || msg.contains("in stock")) {
            String keyword = extractKeyword(msg);
            if (keyword != null) {
                List<Product> matches = productRepository
                        .findFiltered(null, keyword, null, null, Sort.by("id"))
                        .stream()
                        .filter(p -> p.getName().toLowerCase().contains(keyword) ||
                                     (p.getBrand() != null && p.getBrand().toLowerCase().contains(keyword)))
                        .limit(3)
                        .collect(Collectors.toList());

                if (matches.isEmpty()) {
                    return "I couldn't find that product. Please check the spelling or browse our catalog.";
                }

                StringBuilder sb = new StringBuilder("Stock availability:\n\n");
                for (Product p : matches) {
                    sb.append("• ").append(p.getName()).append(": ");
                    if (p.getStock() == 0) {
                        sb.append("Out of Stock\n");
                    } else if (p.getStock() <= 10) {
                        sb.append("Only ").append(p.getStock()).append(" left in stock!\n");
                    } else {
                        sb.append("In Stock (").append(p.getStock()).append(" available)\n");
                    }
                }
                return sb.toString();
            }
        }

        // Cart help
        if (msg.contains("cart") || msg.contains("add to cart")) {
            if (!isAuthenticated(authentication)) {
                return "To add items to your cart, please login first. Click on 'Login' in the navigation bar. " +
                       "Once logged in, you can add products to your cart and manage them on the Cart page.";
            }
            return "Here's how to use your cart:\n\n" +
                   "1. Browse products and click 'Add to Cart' on any product\n" +
                   "2. Go to the Cart page to see all your items\n" +
                   "3. Adjust quantities using the + and - buttons\n" +
                   "4. Remove items with the Remove button\n" +
                   "5. Click 'Proceed to Checkout' when ready to order\n\n" +
                   "Free delivery on orders above ₹999!";
        }

        // Checkout help
        if (msg.contains("checkout") || (msg.contains("order") && msg.contains("place")) || msg.contains("buy")) {
            if (!isAuthenticated(authentication)) {
                return "To place an order, please login first. After login:\n\n" +
                       "1. Add products to your cart\n" +
                       "2. Go to Cart → Proceed to Checkout\n" +
                       "3. Fill in your shipping address\n" +
                       "4. Review and place your order\n" +
                       "5. You'll get an Order ID to track your delivery";
            }
            return "To place an order:\n\n" +
                   "1. Add products to your cart (click 'Add to Cart')\n" +
                   "2. Go to your Cart page\n" +
                   "3. Click 'Proceed to Checkout'\n" +
                   "4. Enter your name, email, phone, and shipping address\n" +
                   "5. Review the order summary and click 'Place Order'\n" +
                   "6. You'll receive a unique Order ID\n\n" +
                   "You can track your order anytime from My Account → Order History.";
        }

        // Order tracking
        if (msg.contains("track") || msg.contains("my order") || msg.contains("order status") ||
            msg.contains("order history") || msg.contains("where is my order")) {
            if (!isAuthenticated(authentication)) {
                return "To view and track your orders, please login first. " +
                       "After login, go to My Account → Order History to see all your orders.";
            }

            User user = userService.getUserEntity(authentication.getName());
            List<OrderDTO> orders = orderService.getMyOrders(user);

            if (orders.isEmpty()) {
                return "You don't have any orders yet. Start shopping and place your first order! " +
                       "You can browse our products and add items to your cart.";
            }

            StringBuilder sb = new StringBuilder("You have " + orders.size() + " order(s):\n\n");
            for (OrderDTO order : orders) {
                sb.append("• Order #").append(order.getOrderId()).append("\n")
                  .append("  Status: ").append(order.getStatus()).append("\n")
                  .append("  Total: ₹").append(String.format("%,.2f", order.getTotalAmount())).append("\n")
                  .append("  Placed: ").append(order.getCreatedAt().toLocalDate()).append("\n")
                  .append("  Items: ").append(order.getItems().size()).append("\n\n");
            }
            sb.append("You can click 'Track Order' next to any order in Order History to see the full delivery timeline.");
            return sb.toString();
        }

        // Search help
        if (msg.contains("how to search") || msg.contains("how do i search") || msg.contains("search product")) {
            return "To search for products:\n\n" +
                   "1. Use the search bar at the top of any page\n" +
                   "2. Type a product name, brand, or category\n" +
                   "3. Press Enter or click the search icon\n" +
                   "4. Use filters on the Products page to narrow by category, price, or rating\n\n" +
                   "You can also ask me directly, e.g., 'Show me headphones under ₹2000'";
        }

        // Delivery/shipping help
        if (msg.contains("deliver") || msg.contains("shipping") || msg.contains("ship")) {
            return "Delivery Information:\n\n" +
                   "• Free delivery on orders above ₹999\n" +
                   "• Orders are processed within 1-2 business days\n" +
                   "• You can track your order status from My Account → Order History\n" +
                   "• Click 'Track Order' to see the full delivery timeline\n\n" +
                   "Order flow: Placed → Confirmed → Shipped → Out for Delivery → Delivered";
        }

        // Return policy
        if (msg.contains("return") || msg.contains("refund") || msg.contains("exchange")) {
            return "Return Policy:\n\n" +
                   "• 7-day hassle-free returns on most products\n" +
                   "• Products must be in original condition with packaging\n" +
                   "• Refunds are processed within 5-7 business days\n" +
                   "• Contact support@atchagamart.com for any issues";
        }

        // Contact/help
        if (msg.contains("contact") || msg.contains("help") || msg.contains("support") || msg.contains("customer care")) {
            return "You can reach us at:\n\n" +
                   "• Email: support@atchagamart.com\n" +
                   "• Phone: +91 98765 43210\n" +
                   "• Address: 12, Market Road, Mumbai\n\n" +
                   "You can also ask me questions about products, prices, orders, or how to use the website!";
        }

        // Thank you
        if (msg.matches(".*\\b(thanks|thank you|thx|thankyou)\\b.*")) {
            return "You're welcome! If you have any other questions about our products or shopping, feel free to ask. Happy shopping at ATCHAGA MART!";
        }

        // Goodbye
        if (msg.matches(".*\\b(bye|goodbye|see you|later)\\b.*")) {
            return "Goodbye! Thank you for shopping with ATCHAGA MART. Have a great day!";
        }

        // Fallback — try product search as last resort
        String keyword = extractKeyword(msg);
        if (keyword != null && keyword.length() > 2) {
            String keywordLower = keyword.toLowerCase();
            List<Product> matches = productRepository
                    .findFiltered(null, keyword, null, null, Sort.by("id"))
                    .stream()
                    .filter(p -> p.getName().toLowerCase().contains(keywordLower) ||
                                 p.getCategory().toLowerCase().contains(keywordLower) ||
                                 p.getCategory().toLowerCase().contains(keywordLower + "s") ||
                                 (keywordLower + "s").contains(p.getCategory().toLowerCase()) ||
                                 (p.getBrand() != null && p.getBrand().toLowerCase().contains(keywordLower)))
                    .limit(3)
                    .collect(Collectors.toList());

            if (matches.isEmpty()) {
                matches = productRepository
                        .findByCategoryContainingIgnoreCase(keyword, Sort.by("id"));
                if (matches.isEmpty()) {
                    matches = productRepository
                            .findByCategoryContainingIgnoreCase(keyword + "s", Sort.by("id"));
                }
            }

            if (!matches.isEmpty()) {
                StringBuilder sb = new StringBuilder("Here's what I found for '" + keyword + "':\n\n");
                for (Product p : matches) {
                    sb.append("• ").append(p.getName()).append(" — ₹")
                      .append(String.format("%,.2f", p.getPrice())).append(" (")
                      .append(p.getStock() > 0 ? "In Stock" : "Out of Stock").append(")\n");
                }
                return sb.toString();
            }
        }

        return "I'm sorry, I can only help with ATCHAGA MART shopping questions. I can assist you with:\n\n" +
               "• Product search (e.g., 'Show me laptops under ₹50000')\n" +
               "• Prices & stock availability\n" +
               "• Cart & checkout help\n" +
               "• Order tracking & history\n" +
               "• Delivery & return information\n\n" +
               "How can I help you today?";
    }

    private String extractKeyword(String msg) {
        String cleaned = msg.replaceAll("(?i)\\b(show|me|find|search|for|a|an|the|is|are|what|do|you|have|i|want|need|looking|price|cost|how|much|of|in|on|and|or|can|could|please|give|tell|about|all|any|some|by|to|from|with|this|that|it|my|your)\\b", " ")
                           .replaceAll("[^a-zA-Z0-9\\s]", " ")
                           .replaceAll("\\s+", " ")
                           .trim();

        String[] words = cleaned.split(" ");
        String best = null;
        for (String word : words) {
            if (word.length() > 2 && (best == null || word.length() > best.length())) {
                best = word;
            }
        }
        return best;
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated() &&
               !"anonymousUser".equals(authentication.getPrincipal());
    }
}
