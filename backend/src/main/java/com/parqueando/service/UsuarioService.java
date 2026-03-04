package com.parqueando.service;

import com.parqueando.api.dto.usuario.UsuarioResponse;
import com.parqueando.cloudinary.CloudinaryService;
import com.parqueando.common.exception.NotFoundException;
import com.parqueando.domain.entity.Usuario;
import com.parqueando.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UsuarioService {

  private final UsuarioRepository usuarioRepository;
  private final CloudinaryService cloudinaryService;

  public UsuarioService(UsuarioRepository usuarioRepository, CloudinaryService cloudinaryService) {
    this.usuarioRepository = usuarioRepository;
    this.cloudinaryService = cloudinaryService;
  }

  public UsuarioResponse getById(Long idUsuario) {
    Usuario u = usuarioRepository.findById(idUsuario)
      .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    return toResponse(u);
  }

  public UsuarioResponse uploadFotoPerfil(Long idUsuario, MultipartFile file) {
    Usuario u = usuarioRepository.findById(idUsuario)
      .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    String url = cloudinaryService.uploadImage(file, "parqueando/usuarios");
    u.setFotoPerfilUrl(url);
    u = usuarioRepository.save(u);
    return toResponse(u);
  }

  private UsuarioResponse toResponse(Usuario u) {
    return new UsuarioResponse(
      u.getIdUsuario(),
      u.getNombres(),
      u.getApellidos(),
      u.getCorreo(),
      u.getTelefono(),
      u.getFotoPerfilUrl(),
      u.getRolPrincipal().name(),
      u.getEsActivo()
    );
  }
}
