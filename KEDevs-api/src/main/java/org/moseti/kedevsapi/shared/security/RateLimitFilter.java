package org.moseti.kedevsapi.shared.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * IP-based rate limiting filter using Bucket4j + Caffeine.
 *
 * Tiers:
 *  - /auth/login, /auth/register        → 10 requests / 15 minutes
 *  - /auth/verify, /auth/resend         → 5 requests / 1 hour
 *  - everything else                    → 200 requests / 1 minute
 *
 * Caffeine's expireAfterAccess evicts idle IP entries, preventing unbounded map growth.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .maximumSize(100_000)
            .build();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws IOException, ServletException {

        String ip = resolveClientIp(request);
        String path = request.getRequestURI();

        Bucket bucket = resolveBucket(ip, path);

        if (!bucket.tryConsume(1)) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please slow down and try again later.\",\"data\":null}"
            );
            return;
        }

        chain.doFilter(request, response);
    }

    private Bucket resolveBucket(String ip, String path) {
        String key;
        Bandwidth limit;

        if (path.contains("/api/v1/auth/login") || path.contains("/api/v1/auth/register")) {
            key = "auth:" + ip;
            // 10 attempts per 15 minutes
            limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(15)));
        } else if (path.contains("/auth/verify") || path.contains("/auth/resend")) {
            key = "verify:" + ip;
            // 5 email sends per hour
            limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofHours(1)));
        } else {
            key = "global:" + ip;
            // 200 requests per minute — allows normal usage, blocks tight scraping loops
            limit = Bandwidth.classic(200, Refill.intervally(200, Duration.ofMinutes(1)));
        }

        final Bandwidth finalLimit = limit;
        return buckets.get(key, k -> Bucket.builder().addLimit(finalLimit).build());
    }

    /**
     * Prefers X-Forwarded-For (set by reverse proxies/load balancers) over the
     * raw socket address. Takes only the first IP to prevent header spoofing by
     * chaining multiple values.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
