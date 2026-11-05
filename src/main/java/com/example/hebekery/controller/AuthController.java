package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.AuthResponse;
import com.example.hebekery.dto.TokenRefreshResponse;
import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.LoginRequest;
import com.example.hebekery.dto.request.RefreshTokenRequest;
import com.example.hebekery.dto.request.RegisterRequest;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import com.example.hebekery.security.CustomUserDetails;
import com.example.hebekery.security.JwtTokenProvider;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Các endpoint đăng nhập, đăng ký, làm mới token và thông tin phiên làm việc")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          UserService userService,
                          UserRepository userRepository,
                          CartService cartService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.userRepository = userRepository;
        this.cartService = cartService;
    }

    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực tài khoản qua email/mật khẩu và trả về JWT access token + refresh token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.failure("Tài khoản của bạn đã bị vô hiệu hóa"));
            }

            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

            try {
                cartService.mergeSessionCartForUser(user);
            } catch (Exception ignored) {
                // Hỗ trợ trường hợp gọi không qua session
            }

            AuthResponse authResponse = new AuthResponse(
                    accessToken,
                    refreshToken,
                    jwtExpirationMs / 1000,
                    UserResponse.from(user)
            );

            return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Email hoặc mật khẩu không chính xác"));
        }
    }

    @Operation(summary = "Đăng ký tài khoản khách hàng", description = "Đăng ký tài khoản mới với vai trò mặc định là USER")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Email đã tồn tại trong hệ thống"));
        }

        boolean success = userService.register(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getPhone()
        );

        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Đăng ký không thành công, vui lòng thử lại"));
        }

        User createdUser = userRepository.findByEmailIgnoreCase(request.getEmail()).orElse(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", UserResponse.from(createdUser)));
    }

    @Operation(summary = "Làm mới Access Token", description = "Cấp lại JWT access token mới khi token cũ hết hạn thông qua Refresh token")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Refresh token không hợp lệ hoặc đã hết hạn"));
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmailIgnoreCase(username).orElse(null);
        if (user == null || !user.isActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa"));
        }

        String newAccessToken = jwtTokenProvider.generateToken(user);
        TokenRefreshResponse response = new TokenRefreshResponse(newAccessToken, jwtExpirationMs / 1000);

        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", response));
    }

    @Operation(summary = "Đăng xuất tài khoản", description = "Hủy phiên xác thực của người dùng hiện tại")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        userService.logout();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @Operation(summary = "Lấy hồ sơ người dùng hiện tại", description = "Trả về thông tin chi tiết của người dùng đang đăng nhập (yêu cầu Bearer token)", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Bạn chưa đăng nhập"));
        }
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", UserResponse.from(currentUser)));
    }
}
