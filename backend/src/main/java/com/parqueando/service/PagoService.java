package com.parqueando.service;

import com.parqueando.api.dto.pago.PagoCreateRequest;
import com.parqueando.api.dto.pago.PagoResponse;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.domain.entity.Pago;
import com.parqueando.domain.entity.Reserva;
import com.parqueando.domain.enums.EstadoPago;
import com.parqueando.domain.enums.EstadoReserva;
import com.parqueando.repository.PagoRepository;
import com.parqueando.repository.ReservaRepository;
import org.springframework.stereotype.Service;

@Service
public class PagoService {

  private final PagoRepository pagoRepository;
  private final ReservaRepository reservaRepository;

  public PagoService(PagoRepository pagoRepository, ReservaRepository reservaRepository) {
    this.pagoRepository = pagoRepository;
    this.reservaRepository = reservaRepository;
  }

  public PagoResponse create(PagoCreateRequest req) {
    Reserva r = reservaRepository.findById(req.idReserva())
      .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));

    if (r.getEstado() == EstadoReserva.CANCELADA) {
      throw new BadRequestException("No se puede pagar una reserva cancelada");
    }

    if (pagoRepository.findByReserva_IdReserva(r.getIdReserva()).isPresent()) {
      throw new BadRequestException("La reserva ya tiene un pago registrado");
    }

    if (req.monto().compareTo(r.getTotalEstimado()) != 0) {
      throw new BadRequestException("El monto debe ser igual al total estimado de la reserva");
    }

    Pago p = Pago.builder()
      .reserva(r)
      .monto(req.monto())
      .metodoPago(req.metodoPago())
      .estadoPago(EstadoPago.COMPLETADO)
      .transaccionId(req.transaccionId())
      .build();

    p = pagoRepository.save(p);

    if (r.getEstado() == EstadoReserva.PENDIENTE) {
      r.setEstado(EstadoReserva.CONFIRMADA);
      reservaRepository.save(r);
    }

    return toResponse(p);
  }

  public PagoResponse getByReserva(Long idReserva) {
    Pago p = pagoRepository.findByReserva_IdReserva(idReserva)
      .orElseThrow(() -> new NotFoundException("Pago no encontrado para la reserva"));
    return toResponse(p);
  }

  private PagoResponse toResponse(Pago p) {
    return new PagoResponse(
      p.getIdPago(),
      p.getReserva().getIdReserva(),
      p.getMonto(),
      p.getMetodoPago(),
      p.getEstadoPago().name(),
      p.getTransaccionId(),
      p.getFechaPago()
    );
  }
}
