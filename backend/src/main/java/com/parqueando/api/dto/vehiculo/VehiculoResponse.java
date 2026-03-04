package com.parqueando.api.dto.vehiculo;

public record VehiculoResponse(
    Long id,
    String marca,
    String modelo,
    String placa,
    String color,
    Boolean principal,
    String imagen
) {}