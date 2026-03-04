package com.parqueando.api.dto.parqueadero;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ParqueaderoRequest(
  @NotNull Long idPropietario,
  @NotBlank @Size(max = 120) String titulo,
  @NotBlank @Size(max = 250) String direccion,
  @Size(max = 250) String referencia,
  @NotNull BigDecimal latitud,
  @NotNull BigDecimal longitud,
  @NotNull @DecimalMin("0.00") BigDecimal tarifaHora,
  @DecimalMin("0.00") BigDecimal tarifaDia,
  Boolean tieneCamara,
  Boolean tieneTecho,
  Boolean tieneGuardia
) {}
