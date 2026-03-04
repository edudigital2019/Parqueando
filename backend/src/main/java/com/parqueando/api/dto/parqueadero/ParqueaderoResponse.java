package com.parqueando.api.dto.parqueadero;

import java.math.BigDecimal;
import java.util.List;

public record ParqueaderoResponse(
  Long idParqueadero,
  Long idPropietario,
  String titulo,
  String direccion,
  String referencia,
  BigDecimal latitud,
  BigDecimal longitud,
  BigDecimal tarifaHora,
  BigDecimal tarifaDia,
  Boolean tieneCamara,
  Boolean tieneTecho,
  Boolean tieneGuardia,
  BigDecimal calificacionPromedio,
  Boolean esActivo,
  List<ParqueaderoImagenResponse> imagenes
) {}
