package com.parqueando.service;

import com.parqueando.api.dto.auth.AuthResponse;
import com.parqueando.api.dto.auth.LoginRequest;
import com.parqueando.api.dto.auth.RegisterRequest;
import com.parqueando.api.dto.auth.RegisterResponse;
import com.parqueando.api.dto.auth.UsuarioResponse;
import com.parqueando.common.exception.BadRequestException;
import com.parqueando.common.exception.UnauthorizedException;
import com.parqueando.domain.entity.Usuario;
import com.parqueando.domain.enums.RolPrincipal;
import com.parqueando.repository.UsuarioRepository;
import com.parqueando.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

  private final UsuarioRepository usuarioRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.usuarioRepository = usuarioRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public RegisterResponse register(RegisterRequest req) {

    String correo = req.correo().trim().toLowerCase();

    if (usuarioRepository.existsByCorreo(correo)) {
      throw new BadRequestException("El correo ya está registrado");
    }

    // ✅ rol: si viene null => CONDUCTOR, caso contrario el que venga en el JSON
    RolPrincipal rolFinal = (req.rolPrincipal() == null)
        ? RolPrincipal.CONDUCTOR
        : req.rolPrincipal();

    // ✅ seguridad mínima: no permitir crear ADMIN desde registro público
    if (rolFinal == RolPrincipal.ADMIN) {
      throw new BadRequestException("No se permite registrar usuarios ADMIN desde este endpoint");
    }

    Usuario u = Usuario.builder()
        .nombres(req.nombres().trim())
        .apellidos(req.apellidos().trim())
        .correo(correo)
        .passwordHash(passwordEncoder.encode(req.password()))
        .telefono(req.telefono() != null ? req.telefono().trim() : null)
        .rolPrincipal(rolFinal)   // ✅ aquí ya no es fijo
        .esActivo(true)
        .build();

    u = usuarioRepository.save(u);

    return RegisterResponse.success(u.getIdUsuario());
  }

  public AuthResponse login(LoginRequest req) {

    String correo = req.correo().trim().toLowerCase();

    Usuario u = usuarioRepository.findByCorreo(correo)
        .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));

    if (!Boolean.TRUE.equals(u.getEsActivo())) {
      throw new UnauthorizedException("Usuario inactivo");
    }

    if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    String token = jwtService.generateToken(
        String.valueOf(u.getIdUsuario()),
        Map.of("rol", u.getRolPrincipal().name(), "correo", u.getCorreo())
    );

    return AuthResponse.ok(token, toUsuarioResponse(u));
  }

  private UsuarioResponse toUsuarioResponse(Usuario u) {
    String nombreCompleto = (u.getNombres() + " " + u.getApellidos()).trim();

    return new UsuarioResponse(
        u.getIdUsuario(),        // uid
        nombreCompleto,          // nombre
        u.getCorreo(),           // email
        u.getTelefono(),         // telefono
        u.getFotoPerfilUrl()     // foto
    );
  }
}