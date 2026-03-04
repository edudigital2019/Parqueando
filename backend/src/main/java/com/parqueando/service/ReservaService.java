package com.parqueando.service;

import com.parqueando.api.dto.reserva.ReservaCreateRequest;
import com.parqueando.api.dto.reserva.ReservaResponse;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.domain.entity.Parqueadero;
import com.parqueando.domain.entity.Reserva;
import com.parqueando.domain.entity.Usuario;
import com.parqueando.domain.entity.Vehiculo;
import com.parqueando.domain.enums.EstadoReserva;
import com.parqueando.repository.ParqueaderoRepository;
import com.parqueando.repository.ReservaRepository;
import com.parqueando.repository.UsuarioRepository;
import com.parqueando.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservaService {

  private final ReservaRepository reservaRepository;
  private final ParqueaderoRepository parqueaderoRepository;
  private final VehiculoRepository vehiculoRepository;
  private final UsuarioRepository usuarioRepository;

  public ReservaService(
      ReservaRepository reservaRepository,
      ParqueaderoRepository parqueaderoRepository,
      VehiculoRepository vehiculoRepository,
      UsuarioRepository usuarioRepository
  ) {
    this.reservaRepository = reservaRepository;
    this.parqueaderoRepository = parqueaderoRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  public ReservaResponse create(ReservaCreateRequest req) {
    if (!req.fechaHoraFin().isAfter(req.fechaHoraInicio())) {
      throw new BadRequestException("La fecha/hora fin debe ser mayor a inicio");
    }
    if (req.fechaHoraInicio().isBefore(LocalDateTime.now().minusMinutes(5))) {
      throw new BadRequestException("La fecha/hora inicio no puede estar en el pasado");
    }

    Parqueadero p = parqueaderoRepository.findById(req.idParqueadero())
      .orElseThrow(() -> new NotFoundException("Parqueadero no encontrado"));

    Vehiculo v = vehiculoRepository.findById(req.idVehiculo())
      .orElseThrow(() -> new NotFoundException("Vehículo no encontrado"));

    Usuario conductor = usuarioRepository.findById(req.idConductor())
      .orElseThrow(() -> new NotFoundException("Conductor no encontrado"));

    List<EstadoReserva> estadosActivos = List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);
    boolean ocupado = !reservaRepository
      .findOverlapping(req.idParqueadero(), req.fechaHoraInicio(), req.fechaHoraFin(), estadosActivos)
      .isEmpty();
    if (ocupado) {
      throw new BadRequestException("El parqueadero ya está reservado en ese rango");
    }

    BigDecimal total = calcularTotal(p, req.fechaHoraInicio(), req.fechaHoraFin());

    Reserva r = Reserva.builder()
      .parqueadero(p)
      .vehiculo(v)
      .conductor(conductor)
      .fechaHoraInicio(req.fechaHoraInicio())
      .fechaHoraFin(req.fechaHoraFin())
      .totalEstimado(total)
      .estado(EstadoReserva.PENDIENTE)
      .codigoReserva(generarCodigo())
      .build();

    r = reservaRepository.save(r);
    return toResponse(r);
  }

  public ReservaResponse confirm(Long idReserva) {
    Reserva r = getEntity(idReserva);
    if (r.getEstado() != EstadoReserva.PENDIENTE) {
      throw new BadRequestException("Solo se puede confirmar una reserva PENDIENTE");
    }
    r.setEstado(EstadoReserva.CONFIRMADA);
    r = reservaRepository.save(r);
    return toResponse(r);
  }

  public ReservaResponse cancel(Long idReserva, String motivo) {
    Reserva r = getEntity(idReserva);
    if (r.getEstado() == EstadoReserva.CANCELADA || r.getEstado() == EstadoReserva.COMPLETADA) {
      throw new BadRequestException("No se puede cancelar una reserva en estado " + r.getEstado());
    }
    r.setEstado(EstadoReserva.CANCELADA);
    r = reservaRepository.save(r);
    return toResponse(r);
  }

  public ReservaResponse completar(Long idReserva) {
    Reserva r = getEntity(idReserva);
    if (r.getEstado() != EstadoReserva.CONFIRMADA) {
      throw new BadRequestException("Solo se puede completar una reserva CONFIRMADA");
    }
    r.setEstado(EstadoReserva.COMPLETADA);
    r = reservaRepository.save(r);
    return toResponse(r);
  }

  public ReservaResponse get(Long idReserva) {
    return toResponse(getEntity(idReserva));
  }

  public List<ReservaResponse> listByConductor(Long idConductor) {
    return reservaRepository.findByConductor_IdUsuario(idConductor).stream().map(this::toResponse).toList();
  }

  public List<ReservaResponse> listByParqueadero(Long idParqueadero) {
    return reservaRepository.findByParqueadero_IdParqueadero(idParqueadero).stream().map(this::toResponse).toList();
  }

  private Reserva getEntity(Long idReserva) {
    return reservaRepository.findById(idReserva)
      .orElseThrow(() -> new NotFoundException("Reserva no encontrada"));
  }

  private BigDecimal calcularTotal(Parqueadero p, LocalDateTime inicio, LocalDateTime fin) {
    Duration d = Duration.between(inicio, fin);
    long minutes = d.toMinutes();
    if (minutes <= 0) {
      throw new BadRequestException("Rango de tiempo inválido");
    }

    BigDecimal tarifaHora = p.getTarifaHora();
    BigDecimal tarifaDia = p.getTarifaDia();

    long hoursCeil = (long) Math.ceil(minutes / 60.0);

    if (tarifaDia != null && hoursCeil >= 8) {
      long diasCeil = (long) Math.ceil(hoursCeil / 24.0);
      return tarifaDia.multiply(BigDecimal.valueOf(diasCeil));
    }

    return tarifaHora.multiply(BigDecimal.valueOf(hoursCeil));
  }

  private String generarCodigo() {
    String raw = UUID.randomUUID().toString().replace("-", "").toUpperCase();
    return ("PA" + raw).substring(0, 15);
  }

  private ReservaResponse toResponse(Reserva r) {
    return new ReservaResponse(
      r.getIdReserva(),
      r.getCodigoReserva(),
      r.getParqueadero().getIdParqueadero(),
      r.getVehiculo().getIdVehiculo(),
      r.getConductor().getIdUsuario(),
      r.getFechaHoraInicio(),
      r.getFechaHoraFin(),
      r.getTotalEstimado(),
      r.getEstado().name(),
      r.getUrlComprobante(),
      r.getFechaCreacion()
    );
  }
}
