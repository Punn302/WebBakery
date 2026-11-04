package com.example.hebekery.security;

import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("Tìm thấy User theo email thì trả về CustomUserDetails với đúng quyền")
    void loadUserByUsername_whenUserExists_shouldReturnCustomUserDetails() {
        User user = new User("u-1", "user@hebekery.vn", "hashedpass", "Nguyen Van A", "0901234567", "ROLE_ADMIN");
        when(userRepository.findByEmailIgnoreCase("user@hebekery.vn")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername("user@hebekery.vn");

        assertNotNull(userDetails);
        assertEquals("user@hebekery.vn", userDetails.getUsername());
        assertEquals("hashedpass", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("Không tìm thấy User theo email thì ném UsernameNotFoundException")
    void loadUserByUsername_whenUserDoesNotExist_shouldThrowException() {
        when(userRepository.findByEmailIgnoreCase("notfound@hebekery.vn")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("notfound@hebekery.vn")
        );
    }
}
