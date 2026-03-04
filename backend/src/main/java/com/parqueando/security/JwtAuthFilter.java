package com.parqueando.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {

    // Si ya hay autenticación, no reprocesar
    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }

    String auth = request.getHeader(HttpHeaders.AUTHORIZATION);

    // 1) Si no hay Bearer token => NO hacemos nada (permitAll funciona normal)
    if (!StringUtils.hasText(auth) || !auth.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = auth.substring(7);

    try {
      // 2) Extraer subject y claims usando TU JwtService
      String subject = jwtService.getSubject(token); // en tu caso: idUsuario (string)
      Map<String, Object> claims = jwtService.getClaims(token);

      // 3) Rol por defecto si no viene en claims
      String rol = String.valueOf(claims.getOrDefault("rol", "CONDUCTOR"));

      // 4) Crear Authentication
      UsernamePasswordAuthenticationToken authToken =
          new UsernamePasswordAuthenticationToken(
              subject,
              null,
              List.of(new SimpleGrantedAuthority("ROLE_" + rol))
          );

      // ✅ Guardar TODOS los claims en details para /api/auth/me (correo, rol, etc.)
      authToken.setDetails(claims);

      // (opcional) si prefieres mantener también detalles de request, usa WebAuthenticationDetailsSource
      // authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

      SecurityContextHolder.getContext().setAuthentication(authToken);

      filterChain.doFilter(request, response);

    } catch (Exception ex) {
      // Si venía token pero es inválido / expirado / firma mala => 401
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write("{\"message\":\"Token inválido o expirado\"}");
    }
  }
}