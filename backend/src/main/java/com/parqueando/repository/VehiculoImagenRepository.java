package com.parqueando.repository;

import com.parqueando.domain.entity.VehiculoImagen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculoImagenRepository extends JpaRepository<VehiculoImagen, Long> {

  List<VehiculoImagen> findByVehiculo_IdVehiculoAndEsActivoTrue(Long idVehiculo);

  Optional<VehiculoImagen> findByIdVehiculoImagenAndEsActivoTrue(Long idVehiculoImagen);

  // Para asegurar ownership: imagen -> vehiculo -> usuario
  Optional<VehiculoImagen> findByIdVehiculoImagenAndVehiculo_IdVehiculoAndVehiculo_Usuario_IdUsuario(
      Long idVehiculoImagen, Long idVehiculo, Long idUsuario
  );
}