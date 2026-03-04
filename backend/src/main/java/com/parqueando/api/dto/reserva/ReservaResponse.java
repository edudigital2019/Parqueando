package com.parqueando.api.dto.reserva;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservaResponse(
  Long idReserva,
  String codigoReserva,
  Long idParqueadero,
  Long idVehiculo,
  Long idConductor,
  LocalDateTime fechaHoraInicio,
  LocalDateTime fechaHoraFin,
  BigDecimal totalEstimado,
  String estado,
  String urlComprobante,
  LocalDateTime fechaCreacion
) {}
