package com.parqueando.api.dto.auth;

public record UsuarioResponse(
  Long uid,
  String nombre,
  String email,
  String telefono,
  String foto
) {}