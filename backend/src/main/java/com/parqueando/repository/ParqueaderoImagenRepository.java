package com.parqueando.repository;

import com.parqueando.domain.entity.ParqueaderoImagen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParqueaderoImagenRepository extends JpaRepository<ParqueaderoImagen, Long> {
  List<ParqueaderoImagen> findByParqueadero_IdParqueadero(Long idParqueadero);
}
