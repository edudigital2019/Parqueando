package com.parqueando.service;

import com.parqueando.api.dto.vehiculo.VehiculoRequest;
import com.parqueando.api.dto.vehiculo.VehiculoResponse;
import com.parqueando.cloudinary.CloudinaryService;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.domain.entity.Usuario;
import com.parqueando.domain.entity.Vehiculo;
import com.parqueando.domain.entity.VehiculoImagen;
import com.parqueando.repository.UsuarioRepository;
import com.parqueando.repository.VehiculoImagenRepository;
import com.parqueando.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class VehiculoService {

  private final VehiculoRepository vehiculoRepository;
  private final UsuarioRepository usuarioRepository;
  private final VehiculoImagenRepository vehiculoImagenRepository;
  private final CloudinaryService cloudinaryService;

  public VehiculoService(
      VehiculoRepository vehiculoRepository,
      UsuarioRepository usuarioRepository,
      VehiculoImagenRepository vehiculoImagenRepository,
      CloudinaryService cloudinaryService
  ) {
    this.vehiculoRepository = vehiculoRepository;
    this.usuarioRepository = usuarioRepository;
    this.vehiculoImagenRepository = vehiculoImagenRepository;
    this.cloudinaryService = cloudinaryService;
  }

  // ✅ Crear vehículo + (opcional) imágenes
  @Transactional
  public VehiculoResponse createWithImages(Long idUsuario, VehiculoRequest req, MultipartFile[] files) {

    Usuario usuario = usuarioRepository.findById(idUsuario)
        .orElseThrow(() -> new NotFoundException("Usuario no existe"));

    String placa = req.placa().trim().toUpperCase();

    // Evita error SQL por unique=true en placa
    if (vehiculoRepository.existsByPlaca(placa)) {
      throw new BadRequestException("La placa ya está registrada");
    }

    Vehiculo v = Vehiculo.builder()
        .usuario(usuario)
        .placa(placa)
        .marca(req.marca().trim())
        .modelo(req.modelo().trim())
        .color(req.color() != null ? req.color().trim() : null)
        .esActivo(true)
        // si tienes el campo principal en Vehiculo, puedes dejarlo en false por defecto
        .build();

    Vehiculo savedVehiculo = vehiculoRepository.save(v);

    // ✅ Subir imágenes si vinieron
    if (files != null && files.length > 0) {

      String folder = "parqueando/vehiculos/" + savedVehiculo.getIdVehiculo();

      for (MultipartFile file : files) {
        if (file == null || file.isEmpty()) continue;

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
          throw new BadRequestException("Solo se permiten archivos de imagen");
        }

        Map<String, String> upload = cloudinaryService.uploadImageWithMetadata(file, folder);

        VehiculoImagen img = VehiculoImagen.builder()
            .vehiculo(savedVehiculo)
            .url(upload.get("url"))
            .publicId(upload.get("publicId"))
            .esActivo(true)
            .build();

        vehiculoImagenRepository.save(img);
      }
    }

    // imagen principal = primera imagen activa (si existe)
    String imagenPrincipal = vehiculoImagenRepository
        .findByVehiculo_IdVehiculoAndEsActivoTrue(savedVehiculo.getIdVehiculo())
        .stream()
        .findFirst()
        .map(VehiculoImagen::getUrl)
        .orElse(null);

    return new VehiculoResponse(
        savedVehiculo.getIdVehiculo(),          // id
        savedVehiculo.getMarca(),
        savedVehiculo.getModelo(),
        savedVehiculo.getPlaca(),
        savedVehiculo.getColor(),
        getPrincipalSafe(savedVehiculo),        // principal
        imagenPrincipal                          // imagen
    );
  }

  // ✅ Listar vehículos del usuario (con imagen principal)
  @Transactional(readOnly = true)
  public List<VehiculoResponse> listByUsuario(Long idUsuario) {

    if (!usuarioRepository.existsById(idUsuario)) {
      throw new NotFoundException("Usuario no existe");
    }

    return vehiculoRepository.findByUsuario_IdUsuario(idUsuario)
        .stream()
        .filter(v -> Boolean.TRUE.equals(v.getEsActivo()))
        .map(v -> {

          String imagenPrincipal = vehiculoImagenRepository
              .findByVehiculo_IdVehiculoAndEsActivoTrue(v.getIdVehiculo())
              .stream()
              .findFirst()
              .map(VehiculoImagen::getUrl)
              .orElse(null);

          return new VehiculoResponse(
              v.getIdVehiculo(),         // id
              v.getMarca(),
              v.getModelo(),
              v.getPlaca(),
              v.getColor(),
              getPrincipalSafe(v),
              imagenPrincipal
          );
        })
        .toList();
  }

  // ✅ Evita romper si aún no agregas 'principal' en Vehiculo
  private boolean getPrincipalSafe(Vehiculo v) {
    try {
      Boolean p = (Boolean) Vehiculo.class.getMethod("getPrincipal").invoke(v);
      return Boolean.TRUE.equals(p);
    } catch (Exception e) {
      // si tu entidad todavía no tiene 'principal', devolvemos false
      return false;
    }
  }
}