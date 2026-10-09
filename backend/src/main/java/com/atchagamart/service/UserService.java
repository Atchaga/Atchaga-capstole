package com.atchagamart.service;

import com.atchagamart.dto.UpdateUserRequest;
import com.atchagamart.dto.UserDTO;
import com.atchagamart.entity.User;
import com.atchagamart.exception.ResourceNotFoundException;
import com.atchagamart.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole());
    }

    public UserDTO updateProfile(String email, UpdateUserRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        userRepository.save(user);
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole());
    }

    public User getUserEntity(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public long countUsers() {
        return userRepository.count();
    }
}
