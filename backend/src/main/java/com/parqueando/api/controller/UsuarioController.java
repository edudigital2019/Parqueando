package com.parqueando.api.controller;

import com.parqueando.api.dto.usuario.UsuarioResponse;
import com.parqueando.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

  private final UsuarioService usuarioService;

  public UsuarioController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
  }

  @GetMapping("/{idUsuario}")
  public ResponseEntity<UsuarioResponse> get(@PathVariable Long idUsuario) {
    return ResponseEntity.ok(usuarioService.getById(idUsuario));
  }

  @PostMapping(value = "/{idUsuario}/foto", consumes = "multipart/form-data")
  public ResponseEntity<UsuarioResponse> uploadFoto(
      @PathVariable Long idUsuario,
      @RequestPart("file") MultipartFile file
  ) {
    return ResponseEntity.ok(usuarioService.uploadFotoPerfil(idUsuario, file));
  }
}
