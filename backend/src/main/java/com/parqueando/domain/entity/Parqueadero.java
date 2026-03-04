package com.parqueando.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "parqueadero")
public class Parqueadero {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_parqueadero")
  private Long idParqueadero;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_propietario", nullable = false)
  private Usuario propietario;

  @Column(nullable = false, length = 120)
  private String titulo;

  @Column(nullable = false, length = 250)
  private String direccion;

  @Column(length = 250)
  private String referencia;

  @Column(nullable = false, precision = 10, scale = 8)
  private BigDecimal latitud;

  @Column(nullable = false, precision = 11, scale = 8)
  private BigDecimal longitud;

  @Column(name = "tarifa_hora", nullable = false, precision = 10, scale = 2)
  private BigDecimal tarifaHora;

  @Column(name = "tarifa_dia", precision = 10, scale = 2)
  private BigDecimal tarifaDia;

  @Column(name = "tiene_camara", nullable = false)
  private Boolean tieneCamara = false;

  @Column(name = "tiene_techo", nullable = false)
  private Boolean tieneTecho = false;

  @Column(name = "tiene_guardia", nullable = false)
  private Boolean tieneGuardia = false;

  @Builder.Default
  @Column(name = "calificacion_promedio", nullable = false, precision = 3, scale = 2)
  private BigDecimal calificacionPromedio = new BigDecimal("5.00");

  @Column(name = "es_activo", nullable = false)
  private Boolean esActivo = true;

  @OneToMany(mappedBy = "parqueadero", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ParqueaderoImagen> imagenes = new ArrayList<>();
}
