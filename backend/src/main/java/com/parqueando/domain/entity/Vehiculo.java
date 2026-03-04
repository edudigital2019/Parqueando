package com.parqueando.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vehiculo")
public class Vehiculo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_vehiculo")
  private Long idVehiculo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_usuario", nullable = false)
  private Usuario usuario;

  @Column(nullable = false, unique = true, length = 20)
  private String placa;

  @Column(nullable = false, length = 50)
  private String marca;

  @Column(nullable = false, length = 50)
  private String modelo;

  @Column(length = 30)
  private String color;

  @Builder.Default
  @Column(name = "es_activo", nullable = false)
  private Boolean esActivo = true;

  @OneToMany(mappedBy = "vehiculo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  private java.util.List<VehiculoImagen> imagenes = new java.util.ArrayList<>();

  @Builder.Default
  @Column(name = "principal", nullable = false)
  private Boolean principal = false;
}