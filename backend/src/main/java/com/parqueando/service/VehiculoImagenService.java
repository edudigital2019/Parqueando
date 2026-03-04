package com.parqueando.service;

import com.parqueando.api.dto.vehiculo.VehiculoImagenResponse;
import com.parqueando.cloudinary.CloudinaryService;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.common.exception.UnauthorizedException;
import com.parqueando.domain.entity.Vehiculo;
import com.parqueando.domain.entity.VehiculoImagen;
import com.parqueando.repository.VehiculoImagenRepository;
import com.parqueando.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class VehiculoImagenService {

  private final VehiculoRepository vehiculoRepository;
  private final VehiculoImagenRepository vehiculoImagenRepository;
  private final CloudinaryService cloudinaryService;

  public VehiculoImagenService(
      VehiculoRepository vehiculoRepository,
      VehiculoImagenRepository vehiculoImagenRepository,
      CloudinaryService cloudinaryService
  ) {
    this.vehiculoRepository = vehiculoRepository;
    this.vehiculoImagenRepository = vehiculoImagenRepository;
    this.cloudinaryService = cloudinaryService;
  }

  @Transactional
  public VehiculoImagenResponse subirImagen(Long idUsuario, Long idVehiculo, MultipartFile file) {

    Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
        .orElseThrow(() -> new NotFoundException("Vehículo no existe"));

    // Ownership: el vehículo debe pertenecer al usuario
    if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
      throw new UnauthorizedException("No autorizado");
    }

    // Validaciones básicas de archivo (opcionales pero recomendadas)
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Archivo vacío");
    }

    String contentType = file.getContentType();
    if (contentType == null || (!contentType.startsWith("image/"))) {
      throw new BadRequestException("Solo se permiten archivos de imagen");
    }

    // Subir a Cloudinary
    String folder = "parqueando/vehiculos/" + idVehiculo;

    Map<String, String> upload = cloudinaryService.uploadImageWithMetadata(file, folder);
    String url = upload.get("url");
    String publicId = upload.get("publicId");

    if (url == null || publicId == null) {
      throw new BadRequestException("Cloudinary no devolvió datos de la imagen");
    }

    VehiculoImagen img = VehiculoImagen.builder()
        .vehiculo(vehiculo)
        .url(url)
        .publicId(publicId)
        .esActivo(true)
        .build();

    VehiculoImagen saved = vehiculoImagenRepository.save(img);

    return new VehiculoImagenResponse(
        saved.getIdVehiculoImagen(),
        saved.getUrl(),
        saved.getPublicId()
    );
  }

  @Transactional(readOnly = true)
  public List<VehiculoImagenResponse> listar(Long idUsuario, Long idVehiculo) {

    Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
        .orElseThrow(() -> new NotFoundException("Vehículo no existe"));

    if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
      throw new UnauthorizedException("No autorizado");
    }

    return vehiculoImagenRepository.findByVehiculo_IdVehiculoAndEsActivoTrue(idVehiculo)
        .stream()
        .map(i -> new VehiculoImagenResponse(i.getIdVehiculoImagen(), i.getUrl(), i.getPublicId()))
        .toList();
  }

  @Transactional
  public void eliminar(Long idUsuario, Long idVehiculo, Long idImagen) {

    VehiculoImagen img = vehiculoImagenRepository
        .findByIdVehiculoImagenAndVehiculo_IdVehiculoAndVehiculo_Usuario_IdUsuario(idImagen, idVehiculo, idUsuario)
        .orElseThrow(() -> new NotFoundException("Imagen no existe"));

    // Borrar en cloudinary
    cloudinaryService.deleteByPublicId(img.getPublicId());

    // Soft delete en BD
    img.setEsActivo(false);
    vehiculoImagenRepository.save(img);
  }
}