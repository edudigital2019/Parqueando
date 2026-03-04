package com.parqueando.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vehiculo_imagen")
public class VehiculoImagen {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_vehiculo_imagen")
  private Long idVehiculoImagen;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_vehiculo", nullable = false)
  private Vehiculo vehiculo;

  @Column(name = "url", nullable = false, length = 800)
  private String url;

  @Column(name = "public_id", nullable = false, length = 200)
  private String publicId;

  @Column(name = "fecha_subida", nullable = false)
  private LocalDateTime fechaSubida;

  @Builder.Default
  @Column(name = "es_activo", nullable = false)
  private Boolean esActivo = true;

  @PrePersist
  public void prePersist() {
    if (fechaSubida == null) fechaSubida = LocalDateTime.now();
  }
}