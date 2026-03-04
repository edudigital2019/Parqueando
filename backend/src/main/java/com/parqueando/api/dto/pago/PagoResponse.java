package com.parqueando.api.dto.pago;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoResponse(
  Long idPago,
  Long idReserva,
  BigDecimal monto,
  String metodoPago,
  String estadoPago,
  String transaccionId,
  LocalDateTime fechaPago
) {}
