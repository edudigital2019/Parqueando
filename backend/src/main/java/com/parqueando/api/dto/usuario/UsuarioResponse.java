package com.parqueando.api.dto.usuario;

public record UsuarioResponse(
  Long idUsuario,
  String nombres,
  String apellidos,
  String correo,
  String telefono,
  String fotoPerfilUrl,
  String rolPrincipal,
  Boolean esActivo
) {}
