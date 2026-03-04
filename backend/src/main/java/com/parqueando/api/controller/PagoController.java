package com.parqueando.api.controller;

import com.parqueando.api.dto.pago.PagoCreateRequest;
import com.parqueando.api.dto.pago.PagoResponse;
import com.parqueando.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

  private final PagoService pagoService;

  public PagoController(PagoService pagoService) {
    this.pagoService = pagoService;
  }

  @PostMapping
  public ResponseEntity<PagoResponse> create(@Valid @RequestBody PagoCreateRequest req) {
    return ResponseEntity.ok(pagoService.create(req));
  }

  @GetMapping("/reserva/{idReserva}")
  public ResponseEntity<PagoResponse> getByReserva(@PathVariable Long idReserva) {
    return ResponseEntity.ok(pagoService.getByReserva(idReserva));
  }
}
