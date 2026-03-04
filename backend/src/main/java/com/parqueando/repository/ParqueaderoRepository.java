package com.parqueando.repository;

import com.parqueando.domain.entity.Parqueadero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParqueaderoRepository extends JpaRepository<Parqueadero, Long> {
  List<Parqueadero> findByPropietario_IdUsuario(Long idPropietario);
}
