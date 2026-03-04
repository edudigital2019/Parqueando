package com.parqueando.api.dto.auth;

public record AuthResponse(
  boolean ok,
  String token,
  UsuarioResponse usuario
) {
  public static AuthResponse ok(String token, UsuarioResponse usuario) {
    return new AuthResponse(true, token, usuario);
  }
}