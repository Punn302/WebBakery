package com.example.hebekery.security;

import com.example.hebekery.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class CustomUserDetails implements UserDetails {
    private final User user;
    private final List<GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.user = user;
        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        }
        String authority = role.startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    public User getUser() {
        return user;
    }

    public String getId() {
        return user.getId();
    }

    public String getRole() {
        return user.getRole();
    }

    public String getName() {
        return user.getName();
    }

    public String getPhone() {
        return user.getPhone();
    }

    public boolean isForcePasswordChange() {
        return user.isForcePasswordChange();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isActive();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}
