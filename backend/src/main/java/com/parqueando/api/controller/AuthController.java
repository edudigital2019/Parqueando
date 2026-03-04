package com.parqueando.api.controller;

import com.parqueando.api.dto.auth.AuthResponse;
import com.parqueando.api.dto.auth.LoginRequest;
import com.parqueando.api.dto.auth.MeResponse;
import com.parqueando.api.dto.auth.RegisterRequest;
import com.parqueando.api.dto.auth.RegisterResponse;
import com.parqueando.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(authService.register(req));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    return ResponseEntity.ok(authService.login(req));
  }

  // Nuevo endpoint protegido
  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(Authentication authentication) {

    String subject = authentication.getName(); // tu sub = idUsuario

    // authorities
    List<String> authorities = authentication.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .toList();

    // claims vienen del filtro (authToken.setDetails(claims))
    String correo = null;
    String rol = null;

    Object details = authentication.getDetails();
    if (details instanceof Map<?, ?> map) {
      Object c = map.get("correo");
      Object r = map.get("rol");
      correo = (c != null) ? String.valueOf(c) : null;
      rol = (r != null) ? String.valueOf(r) : null;
    }

    // fallback si no vino rol
    if (rol == null) {
      rol = authorities.stream()
          .filter(a -> a.startsWith("ROLE_"))
          .map(a -> a.substring(5))
          .findFirst()
          .orElse("CONDUCTOR");
    }

    return ResponseEntity.ok(new MeResponse(subject, correo, rol, authorities));
  }
}