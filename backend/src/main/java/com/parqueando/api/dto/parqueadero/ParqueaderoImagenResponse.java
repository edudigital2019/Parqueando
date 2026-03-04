package com.parqueando.api.dto.parqueadero;

public record ParqueaderoImagenResponse(
  Long idImagen,
  String imageUrl,
  Boolean esPrincipal
) {}
