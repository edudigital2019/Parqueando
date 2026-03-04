package com.parqueando.api.dto.reserva;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReservaCreateRequest(
  @NotNull Long idParqueadero,
  @NotNull Long idVehiculo,
  @NotNull Long idConductor,

  @NotNull
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  LocalDateTime fechaHoraInicio,

  @NotNull
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  LocalDateTime fechaHoraFin
) {}