package com.atchagamart.service;

import com.atchagamart.dto.*;
import com.atchagamart.entity.User;
import com.atchagamart.exception.ResourceNotFoundException;
import com.atchagamart.repository.UserRepository;
import com.atchagamart.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered. Please login.");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        if (!role.equals("USER") && !role.equals("SELLER")) {
            role = "USER";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(role);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        return "A password reset link has been sent to " + user.getEmail() + ". Please check your inbox.";
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDTO(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getAddress(), u.getRole()))
                .collect(Collectors.toList());
    }
}
