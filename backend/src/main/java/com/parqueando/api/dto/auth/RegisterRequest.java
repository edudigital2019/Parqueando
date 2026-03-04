package com.parqueando.api.dto.auth;

import com.parqueando.domain.enums.RolPrincipal;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

  @NotBlank @Size(max = 100)
  String nombres,

  @NotBlank @Size(max = 100)
  String apellidos,

  @NotBlank @Email @Size(max = 150)
  String correo,

  @NotBlank @Size(min = 6, max = 72)
  String password,

  @Size(max = 20)
  String telefono,

  @Schema(
      description = "Rol del usuario. Si no se envía, será CONDUCTOR",
      example = "CONDUCTOR",
      allowableValues = {"CONDUCTOR", "PROPIETARIO", "ADMIN"}
  )
  RolPrincipal rolPrincipal

) {}