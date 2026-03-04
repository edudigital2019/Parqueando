package com.parqueando.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "parqueadero_imagen")
public class ParqueaderoImagen {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_imagen")
  private Long idImagen;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_parqueadero", nullable = false)
  private Parqueadero parqueadero;

  @Column(name = "image_url", nullable = false, length = 500)
  private String imageUrl;

  @Column(name = "es_principal", nullable = false)
  private Boolean esPrincipal = false;
}
