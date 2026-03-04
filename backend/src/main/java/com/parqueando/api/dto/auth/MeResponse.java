package com.parqueando.api.dto.auth;

import java.util.List;

public record MeResponse(
  String subject,
  String correo,
  String rol,
  List<String> authorities
) {}