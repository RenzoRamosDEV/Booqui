package org.service_user.user.service.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos de un usuario (respuesta)")
public class UserResponseDTO {

    @Schema(description = "ID único del usuario", example = "1")
    private Long idUser;
    
    @Schema(description = "Nombre del usuario", example = "Juan")
    private String firstName;
    
    @Schema(description = "Apellido del usuario", example = "Pérez")
    private String lastName;
    
    @Schema(description = "Fecha de nacimiento", example = "1990-05-15")
    private LocalDate dateOfBirth;
    
    @Schema(description = "Número de teléfono", example = "631835827")
    private String contactPhone;
    
    @Schema(description = "Correo electrónico", example = "juan.perez@email.com")
    private String contactEmail;
    
    @Schema(description = "Rol del usuario", example = "CUSTOMER", allowableValues = {"ADMIN", "CUSTOMER"})
    private String role;
}
