package com.parqueando.domain.entity;

import com.parqueando.domain.enums.RolPrincipal;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "usuario")
public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_usuario")
  private Long idUsuario;

  @Column(nullable = false, length = 100)
  private String nombres;

  @Column(nullable = false, length = 100)
  private String apellidos;

  @Column(nullable = false, unique = true, length = 150)
  private String correo;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(length = 20)
  private String telefono;

  @Column(name = "foto_perfil_url", length = 500)
  private String fotoPerfilUrl;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(name = "rol_principal", nullable = false, length = 20)
  private RolPrincipal rolPrincipal = RolPrincipal.CONDUCTOR;

  @Builder.Default
  @Column(name = "fecha_registro", nullable = false)
  private LocalDateTime fechaRegistro = LocalDateTime.now();

  @Builder.Default
  @Column(name = "es_activo", nullable = false)
  private Boolean esActivo = true;

  @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Vehiculo> vehiculos = new ArrayList<>();

  @OneToMany(mappedBy = "propietario", fetch = FetchType.LAZY)
  private List<Parqueadero> parqueaderos = new ArrayList<>();
}
