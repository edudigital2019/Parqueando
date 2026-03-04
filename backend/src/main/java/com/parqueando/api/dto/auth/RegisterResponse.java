package com.parqueando.api.dto.auth;

public record RegisterResponse(
    boolean ok,
    String mensaje,
    Long uid
) {
    public static RegisterResponse success(Long uid) {
        return new RegisterResponse(true, "Usuario creado exitosamente", uid);
    }
}