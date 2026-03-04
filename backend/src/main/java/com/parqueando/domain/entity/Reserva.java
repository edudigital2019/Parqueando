package com.parqueando.domain.entity;

import com.parqueando.domain.enums.EstadoReserva;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reserva")
public class Reserva {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_reserva")
  private Long idReserva;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_parqueadero", nullable = false)
  private Parqueadero parqueadero;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_vehiculo", nullable = false)
  private Vehiculo vehiculo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_conductor", nullable = false)
  private Usuario conductor;

  @Column(name = "fecha_hora_inicio", nullable = false)
  private LocalDateTime fechaHoraInicio;

  @Column(name = "fecha_hora_fin", nullable = false)
  private LocalDateTime fechaHoraFin;

  @Column(name = "total_estimado", nullable = false, precision = 10, scale = 2)
  private BigDecimal totalEstimado;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  @Builder.Default
  private EstadoReserva estado = EstadoReserva.PENDIENTE;

  @Column(name = "codigo_reserva", nullable = false, length = 15, unique = true)
  private String codigoReserva;

  @Column(name = "url_comprobante", length = 500)
  private String urlComprobante;

  @Column(name = "fecha_creacion", nullable = false)
  @Builder.Default
  private LocalDateTime fechaCreacion = LocalDateTime.now();

  @OneToOne(mappedBy = "reserva", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  private Pago pago;
}
