package org.service_user.user.annotation;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.service_user.user.service.model.UserResponseDTO;

import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;

public class ApiResponsesAnnotations {

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Operación exitosa",
            content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
        )
    })
    public @interface OkResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Usuario encontrado",
            content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
        )
    })
    public @interface OkResponseSingle {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Operación completada exitosamente"
        )
    })
    public @interface StandardOkResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Recurso creado exitosamente",
            content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
        )
    })
    public @interface CreatedResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Operación completada sin contenido"
        )
    })
    public @interface NoContentResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "400",
            description = "Solicitud inválida - datos mal formados o validación fallida"
        )
    })
    public @interface BadRequestResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "404",
            description = "Recurso no encontrado"
        )
    })
    public @interface NotFoundResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "409",
            description = "Conflicto - el recurso ya existe o viola una restricción de unicidad"
        )
    })
    public @interface ConflictResponse {}

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
            responseCode = "400",
            description = "Solicitud inválida"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Recurso no encontrado"
        )
    })
    public @interface StandardResponses {}
}
