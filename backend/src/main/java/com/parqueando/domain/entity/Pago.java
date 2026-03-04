package com.parqueando.domain.entity;

import com.parqueando.domain.enums.EstadoPago;
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
@Table(name = "pago")
public class Pago {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_pago")
  private Long idPago;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_reserva", nullable = false, unique = true)
  private Reserva reserva;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal monto;

  @Column(name = "metodo_pago", length = 50)
  private String metodoPago;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_pago", nullable = false, length = 20)
  @Builder.Default
  private EstadoPago estadoPago = EstadoPago.COMPLETADO;

  @Column(name = "transaccion_id", length = 100)
  private String transaccionId;

  @Column(name = "fecha_pago", nullable = false)
  @Builder.Default
  private LocalDateTime fechaPago = LocalDateTime.now();

  @PrePersist
  public void prePersist() {
    if (fechaPago == null) fechaPago = LocalDateTime.now();
    if (estadoPago == null) estadoPago = EstadoPago.COMPLETADO;
  }
}