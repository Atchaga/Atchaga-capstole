package com.atchagamart.controller;

import com.atchagamart.dto.UpdateUserRequest;
import com.atchagamart.dto.UserDTO;
import com.atchagamart.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(@RequestBody UpdateUserRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }
}
