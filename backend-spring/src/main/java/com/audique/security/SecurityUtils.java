package com.audique.security;

import com.audique.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SecurityUtils {

    public String getSupabaseUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject(); // "sub" claim = Supabase User ID
        }
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        // Fallback for dev / unauthenticated requests
        throw new UnauthorizedException("No authenticated Supabase user found in security context");
    }

    public String getUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("email");
        }
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("email");
        }
        return null;
    }

    public String getUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Map<String, Object> metadata = jwtAuth.getToken().getClaimAsMap("user_metadata");
            if (metadata != null) {
                Object name = metadata.get("name");
                if (name != null) return name.toString();
                Object fullName = metadata.get("full_name");
                if (fullName != null) return fullName.toString();
            }
            return jwtAuth.getToken().getClaimAsString("email");
        }
        return null;
    }
}

