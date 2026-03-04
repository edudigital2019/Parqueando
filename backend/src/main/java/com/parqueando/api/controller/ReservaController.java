package com.parqueando.api.controller;

import com.parqueando.api.dto.reserva.ReservaCreateRequest;
import com.parqueando.api.dto.reserva.ReservaResponse;
import com.parqueando.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

  private final ReservaService reservaService;

  public ReservaController(ReservaService reservaService) {
    this.reservaService = reservaService;
  }

  @PostMapping
  public ResponseEntity<ReservaResponse> create(@Valid @RequestBody ReservaCreateRequest req) {
    return ResponseEntity.ok(reservaService.create(req));
  }

  @GetMapping("/{idReserva}")
  public ResponseEntity<ReservaResponse> get(@PathVariable Long idReserva) {
    return ResponseEntity.ok(reservaService.get(idReserva));
  }

  @PostMapping("/{idReserva}/confirmar")
  public ResponseEntity<ReservaResponse> confirmar(@PathVariable Long idReserva) {
    return ResponseEntity.ok(reservaService.confirm(idReserva));
  }

  @PostMapping("/{idReserva}/cancelar")
  public ResponseEntity<ReservaResponse> cancelar(@PathVariable Long idReserva, @RequestParam(required = false) String motivo) {
    return ResponseEntity.ok(reservaService.cancel(idReserva, motivo));
  }

  @PostMapping("/{idReserva}/completar")
  public ResponseEntity<ReservaResponse> completar(@PathVariable Long idReserva) {
    return ResponseEntity.ok(reservaService.completar(idReserva));
  }

  @GetMapping("/conductor/{idConductor}")
  public ResponseEntity<List<ReservaResponse>> listByConductor(@PathVariable Long idConductor) {
    return ResponseEntity.ok(reservaService.listByConductor(idConductor));
  }

  @GetMapping("/parqueadero/{idParqueadero}")
  public ResponseEntity<List<ReservaResponse>> listByParqueadero(@PathVariable Long idParqueadero) {
    return ResponseEntity.ok(reservaService.listByParqueadero(idParqueadero));
  }
}
