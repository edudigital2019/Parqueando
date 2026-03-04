package com.parqueando.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parqueando.api.dto.vehiculo.VehiculoRequest;
import com.parqueando.api.dto.vehiculo.VehiculoResponse;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.UnauthorizedException;
import com.parqueando.service.VehiculoService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/usuarios/{idUsuario}/vehiculos")
public class VehiculoController {

  private final VehiculoService vehiculoService;
  private final ObjectMapper objectMapper;
  private final Validator validator;

  public VehiculoController(VehiculoService vehiculoService, ObjectMapper objectMapper, Validator validator) {
    this.vehiculoService = vehiculoService;
    this.objectMapper = objectMapper;
    this.validator = validator;
  }

  private void validarPropietario(Long idUsuarioPath, Authentication auth) {
    Long idToken = Long.valueOf(auth.getName()); // sub del JWT = idUsuario
    if (!idToken.equals(idUsuarioPath)) {
      throw new UnauthorizedException("No autorizado para acceder a este recurso");
    }
  }

  /**
   * ✅ Crear vehículo + (opcional) subir 1..N imágenes en el mismo POST.
   *
   * multipart/form-data:
   * - data: JSON string {"placa":"...","marca":"...","modelo":"...","color":"..."}
   * - files: (opcional) uno o varios archivos de imagen
   */
  @PostMapping(consumes = "multipart/form-data")
  public ResponseEntity<VehiculoResponse> create(
      @PathVariable Long idUsuario,
      @RequestPart("data") String dataJson,
      @RequestPart(value = "files", required = false) MultipartFile[] files,
      Authentication authentication
  ) {
    validarPropietario(idUsuario, authentication);

    VehiculoRequest req;
    try {
      req = objectMapper.readValue(dataJson, VehiculoRequest.class);
    } catch (Exception e) {
      throw new BadRequestException("JSON inválido en 'data': " + e.getMessage());
    }

    // Validación manual porque aquí no usamos @Valid sobre @RequestBody
    Set<ConstraintViolation<VehiculoRequest>> violations = validator.validate(req);
    if (!violations.isEmpty()) {
      String msg = violations.stream()
          .map(v -> v.getPropertyPath() + ": " + v.getMessage())
          .reduce((a, b) -> a + "; " + b)
          .orElse("Datos inválidos");
      throw new BadRequestException(msg);
    }

    VehiculoResponse response = vehiculoService.createWithImages(idUsuario, req, files);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * ✅ Listar vehículos del usuario (con imagen principal + principal true/false)
   */
  @GetMapping
  public ResponseEntity<List<VehiculoResponse>> list(
      @PathVariable Long idUsuario,
      Authentication authentication
  ) {
    validarPropietario(idUsuario, authentication);

    return ResponseEntity.ok(vehiculoService.listByUsuario(idUsuario));
  }
}