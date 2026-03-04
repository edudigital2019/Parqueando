package com.parqueando.api.controller;

import com.parqueando.api.dto.vehiculo.VehiculoImagenResponse;
import com.parqueando.common.exception.UnauthorizedException;
import com.parqueando.service.VehiculoImagenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios/{idUsuario}/vehiculos/{idVehiculo}/imagenes")
public class VehiculoImagenController {

  private final VehiculoImagenService vehiculoImagenService;

  public VehiculoImagenController(VehiculoImagenService vehiculoImagenService) {
    this.vehiculoImagenService = vehiculoImagenService;
  }

  private void validarPropietario(Long idUsuarioPath, Authentication auth) {
    Long idToken = Long.valueOf(auth.getName()); // sub = idUsuario
    if (!idToken.equals(idUsuarioPath)) {
      throw new UnauthorizedException("No autorizado para acceder a este recurso");
    }
  }

  @PostMapping(consumes = "multipart/form-data")
  public ResponseEntity<VehiculoImagenResponse> subir(
      @PathVariable Long idUsuario,
      @PathVariable Long idVehiculo,
      @RequestPart("file") MultipartFile file,
      Authentication authentication
  ) {
    validarPropietario(idUsuario, authentication);

    VehiculoImagenResponse res = vehiculoImagenService.subirImagen(idUsuario, idVehiculo, file);
    return ResponseEntity.status(HttpStatus.CREATED).body(res);
  }

  @GetMapping
  public ResponseEntity<List<VehiculoImagenResponse>> listar(
      @PathVariable Long idUsuario,
      @PathVariable Long idVehiculo,
      Authentication authentication
  ) {
    validarPropietario(idUsuario, authentication);
    return ResponseEntity.ok(vehiculoImagenService.listar(idUsuario, idVehiculo));
  }

  @DeleteMapping("/{idImagen}")
  public ResponseEntity<Void> eliminar(
      @PathVariable Long idUsuario,
      @PathVariable Long idVehiculo,
      @PathVariable Long idImagen,
      Authentication authentication
  ) {
    validarPropietario(idUsuario, authentication);
    vehiculoImagenService.eliminar(idUsuario, idVehiculo, idImagen);
    return ResponseEntity.noContent().build();
  }
}