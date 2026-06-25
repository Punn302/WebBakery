package com.example.hebekery.config;

import com.example.hebekery.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class AdminAccessFilter extends OncePerRequestFilter {
    private final UserService userService;

    public AdminAccessFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if ((path.startsWith("/admin") || path.startsWith("/api/admin")) && !userService.isAdmin()) {
            if (path.startsWith("/api/admin")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"success\":false,\"message\":\"Bạn cần đăng nhập bằng tài khoản admin\"}");
                return;
            }
            response.sendRedirect("/login?redirect=" + URLEncoder.encode(path, StandardCharsets.UTF_8));
            return;
        }
        filterChain.doFilter(request, response);
    }
}
