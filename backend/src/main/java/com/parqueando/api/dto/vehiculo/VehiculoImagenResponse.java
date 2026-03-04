package com.parqueando.api.dto.vehiculo;

public record VehiculoImagenResponse(
    Long idVehiculoImagen,
    String url,
    String publicId
) {}