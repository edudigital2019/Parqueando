package com.parqueando.api.controller;

import com.parqueando.api.dto.parqueadero.ParqueaderoImagenResponse;
import com.parqueando.api.dto.parqueadero.ParqueaderoRequest;
import com.parqueando.api.dto.parqueadero.ParqueaderoResponse;
import com.parqueando.service.ParqueaderoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/parqueaderos")
public class ParqueaderoController {

  private final ParqueaderoService parqueaderoService;

  public ParqueaderoController(ParqueaderoService parqueaderoService) {
    this.parqueaderoService = parqueaderoService;
  }

  @PostMapping
  public ResponseEntity<ParqueaderoResponse> create(@Valid @RequestBody ParqueaderoRequest req) {
    return ResponseEntity.ok(parqueaderoService.create(req));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ParqueaderoResponse> get(@PathVariable Long id) {
    return ResponseEntity.ok(parqueaderoService.get(id));
  }

  @GetMapping
  public ResponseEntity<List<ParqueaderoResponse>> listAll() {
    return ResponseEntity.ok(parqueaderoService.listAll());
  }

  @GetMapping("/propietario/{idPropietario}")
  public ResponseEntity<List<ParqueaderoResponse>> listByPropietario(@PathVariable Long idPropietario) {
    return ResponseEntity.ok(parqueaderoService.listByPropietario(idPropietario));
  }

  @PostMapping(value = "/{idParqueadero}/imagenes", consumes = "multipart/form-data")
  public ResponseEntity<ParqueaderoImagenResponse> addImagen(
      @PathVariable Long idParqueadero,
      @RequestPart("file") MultipartFile file,
      @RequestParam(defaultValue = "false") boolean esPrincipal
  ) {
    return ResponseEntity.ok(parqueaderoService.addImagen(idParqueadero, file, esPrincipal));
  }

  @DeleteMapping("/imagenes/{idImagen}")
  public ResponseEntity<Void> deleteImagen(@PathVariable Long idImagen) {
    parqueaderoService.deleteImagen(idImagen);
    return ResponseEntity.noContent().build();
  }
}
