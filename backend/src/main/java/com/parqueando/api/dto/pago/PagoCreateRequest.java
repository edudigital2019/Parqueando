package com.parqueando.api.dto.pago;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PagoCreateRequest(
  @NotNull Long idReserva,
  @NotNull @DecimalMin("0.01") BigDecimal monto,
  @Size(max = 50) String metodoPago,
  @Size(max = 100) String transaccionId
) {}
