package com.parqueando.repository;

import com.parqueando.domain.entity.Reserva;
import com.parqueando.domain.enums.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
  List<Reserva> findByConductor_IdUsuario(Long idConductor);
  List<Reserva> findByParqueadero_IdParqueadero(Long idParqueadero);

  @Query("""
     SELECT r FROM Reserva r
     WHERE r.parqueadero.idParqueadero = :idParqueadero
       AND r.estado IN (:estados)
       AND (r.fechaHoraInicio < :fin) AND (r.fechaHoraFin > :inicio)
  """)
  List<Reserva> findOverlapping(Long idParqueadero, LocalDateTime inicio, LocalDateTime fin, List<EstadoReserva> estados);
}
