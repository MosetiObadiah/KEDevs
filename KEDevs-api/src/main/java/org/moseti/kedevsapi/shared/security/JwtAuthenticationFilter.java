package org.moseti.kedevsapi.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.moseti.kedevsapi.auth.service.JwtService;
import org.moseti.kedevsapi.shared.enums.AccountStatus;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader(Constants.JWT_HEADER);

        if (authHeader == null || !authHeader.startsWith(Constants.JWT_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(Constants.JWT_PREFIX.length());

            if (jwtService.isTokenValid(jwt) && !jwtService.isTokenExpired(jwt)) {
                UUID userId = jwtService.extractUserId(jwt);

                // Real-time block for Banned or Suspended users
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    if (user.getAccountStatus() == AccountStatus.BANNED || user.getAccountStatus() == AccountStatus.SUSPENDED) {
                        String uri = request.getRequestURI();
                        // Allow only status check, appeals, logout, and token refresh
                        if (!uri.endsWith("/auth/me") && !uri.endsWith("/auth/appeal") && !uri.endsWith("/auth/logout") && !uri.endsWith("/auth/refresh")) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Account is suspended or banned.\",\"data\":null}");
                            return;
                        }
                    }
                }

                String role = jwtService.extractRole(jwt).name();

                var authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                var authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        authorities
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Invalid token - let the request continue without authentication
            logger.error("JWT authentication failed", e);
        }

        filterChain.doFilter(request, response);
    }
}


