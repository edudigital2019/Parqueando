package com.parqueando.repository;

import com.parqueando.domain.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

  List<Vehiculo> findByUsuario_IdUsuario(Long idUsuario);

  boolean existsByPlaca(String placa);
}