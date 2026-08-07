package com.fieldservicemanagement.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService) {

        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("--------------------------------");
        System.out.println("REQUEST : " + request.getRequestURI());
        System.out.println("METHOD  : " + request.getMethod());

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println("OPTIONS request - skipping JWT");
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "AUTH HEADER PRESENT : "
                        + (authHeader != null)
        );

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No Bearer token found"
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7);

        try {

            String email =
                    jwtUtil.extractEmail(token);

            System.out.println(
                    "JWT EMAIL : " + email
            );

            if (email != null
                    && SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                    == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        email
                                );

                boolean valid =
                        jwtUtil.validateToken(
                                token,
                                email
                        );

                System.out.println(
                        "JWT VALID : " + valid
                );

                if (valid) {

                    UsernamePasswordAuthenticationToken
                            authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(
                                            request
                                    )
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authToken
                            );

                    System.out.println(
                            "AUTHENTICATED : "
                                    + authToken.isAuthenticated()
                    );

                    System.out.println(
                            "AUTHORITIES : "
                                    + authToken.getAuthorities()
                    );
                }
            }

        } catch (Exception exception) {

            System.out.println(
                    "JWT FILTER ERROR:"
            );

            exception.printStackTrace();

            SecurityContextHolder
                    .clearContext();
        }

        System.out.println(
                "FINAL SECURITY AUTH : "
                        + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
        );

        filterChain.doFilter(
                request,
                response
        );
    }
}