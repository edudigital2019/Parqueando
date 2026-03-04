package com.parqueando.api.dto.vehiculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VehiculoRequest(
    @NotBlank @Size(max = 20) String placa,
    @NotBlank @Size(max = 50) String marca,
    @NotBlank @Size(max = 50) String modelo,
    @Size(max = 30) String color
) {}