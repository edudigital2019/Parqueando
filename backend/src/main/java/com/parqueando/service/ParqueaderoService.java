package com.parqueando.service;

import com.parqueando.api.dto.parqueadero.ParqueaderoImagenResponse;
import com.parqueando.api.dto.parqueadero.ParqueaderoRequest;
import com.parqueando.api.dto.parqueadero.ParqueaderoResponse;
import com.parqueando.cloudinary.CloudinaryService;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.domain.entity.Parqueadero;
import com.parqueando.domain.entity.ParqueaderoImagen;
import com.parqueando.domain.entity.Usuario;
import com.parqueando.repository.ParqueaderoImagenRepository;
import com.parqueando.repository.ParqueaderoRepository;
import com.parqueando.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ParqueaderoService {

  private static final BigDecimal CALIFICACION_INICIAL = new BigDecimal("5.00"); // o "0.00" si prefieres
  // private static final BigDecimal CALIFICACION_INICIAL = BigDecimal.ZERO.setScale(2);

  private final ParqueaderoRepository parqueaderoRepository;
  private final ParqueaderoImagenRepository imagenRepository;
  private final UsuarioRepository usuarioRepository;
  private final CloudinaryService cloudinaryService;

  public ParqueaderoService(
      ParqueaderoRepository parqueaderoRepository,
      ParqueaderoImagenRepository imagenRepository,
      UsuarioRepository usuarioRepository,
      CloudinaryService cloudinaryService
  ) {
    this.parqueaderoRepository = parqueaderoRepository;
    this.imagenRepository = imagenRepository;
    this.usuarioRepository = usuarioRepository;
    this.cloudinaryService = cloudinaryService;
  }

  public ParqueaderoResponse create(ParqueaderoRequest req) {
    Usuario propietario = usuarioRepository.findById(req.idPropietario())
        .orElseThrow(() -> new NotFoundException("Propietario no encontrado"));

    Parqueadero p = Parqueadero.builder()
        .propietario(propietario)
        .titulo(req.titulo())
        .direccion(req.direccion())
        .referencia(req.referencia())
        .latitud(req.latitud())
        .longitud(req.longitud())
        .tarifaHora(req.tarifaHora())
        .tarifaDia(req.tarifaDia())
        .tieneCamara(Boolean.TRUE.equals(req.tieneCamara()))
        .tieneTecho(Boolean.TRUE.equals(req.tieneTecho()))
        .tieneGuardia(Boolean.TRUE.equals(req.tieneGuardia()))
        .esActivo(true)
        // ✅ CLAVE: con Lombok Builder, si no lo seteas aquí puede ir null
        .calificacionPromedio(CALIFICACION_INICIAL)
        .build();

    p = parqueaderoRepository.save(p);
    return toResponse(p);
  }

  public ParqueaderoResponse get(Long id) {
    Parqueadero p = parqueaderoRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Parqueadero no encontrado"));
    return toResponse(p);
  }

  public List<ParqueaderoResponse> listAll() {
    return parqueaderoRepository.findAll().stream().map(this::toResponse).toList();
  }

  public List<ParqueaderoResponse> listByPropietario(Long idPropietario) {
    return parqueaderoRepository.findByPropietario_IdUsuario(idPropietario)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public ParqueaderoImagenResponse addImagen(Long idParqueadero, MultipartFile file, boolean esPrincipal) {
    Parqueadero p = parqueaderoRepository.findById(idParqueadero)
        .orElseThrow(() -> new NotFoundException("Parqueadero no encontrado"));

    String url = cloudinaryService.uploadImage(file, "parqueando/parqueaderos/" + idParqueadero);

    if (esPrincipal) {
      List<ParqueaderoImagen> imgs = imagenRepository.findByParqueadero_IdParqueadero(idParqueadero);
      imgs.forEach(i -> i.setEsPrincipal(false));
      imagenRepository.saveAll(imgs);
    }

    ParqueaderoImagen img = ParqueaderoImagen.builder()
        .parqueadero(p)
        .imageUrl(url)
        .esPrincipal(esPrincipal)
        .build();

    img = imagenRepository.save(img);

    return new ParqueaderoImagenResponse(
        img.getIdImagen(),
        img.getImageUrl(),
        img.getEsPrincipal()
    );
  }

  public void deleteImagen(Long idImagen) {
    if (!imagenRepository.existsById(idImagen)) {
      throw new NotFoundException("Imagen no encontrada");
    }
    imagenRepository.deleteById(idImagen);
  }

  private ParqueaderoResponse toResponse(Parqueadero p) {
    List<ParqueaderoImagenResponse> imgs = imagenRepository
        .findByParqueadero_IdParqueadero(p.getIdParqueadero())
        .stream()
        .map(i -> new ParqueaderoImagenResponse(i.getIdImagen(), i.getImageUrl(), i.getEsPrincipal()))
        .toList();

    return new ParqueaderoResponse(
        p.getIdParqueadero(),
        p.getPropietario().getIdUsuario(),
        p.getTitulo(),
        p.getDireccion(),
        p.getReferencia(),
        p.getLatitud(),
        p.getLongitud(),
        p.getTarifaHora(),
        p.getTarifaDia(),
        p.getTieneCamara(),
        p.getTieneTecho(),
        p.getTieneGuardia(),
        p.getCalificacionPromedio(),
        p.getEsActivo(),
        imgs
    );
  }
}