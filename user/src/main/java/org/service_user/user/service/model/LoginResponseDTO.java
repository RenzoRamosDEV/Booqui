package org.service_user.user.service.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta del login")
public class LoginResponseDTO {

    @Schema(description = "Indica si el login fue exitoso", example = "true")
    private boolean success;

    @Schema(description = "Mensaje descriptivo del resultado", example = "Login exitoso")
    private String message;

    @Schema(description = "Datos del usuario (solo si el login es exitoso)")
    private UserResponseDTO user;
}
