package org.service_event.event.service.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos de un evento (respuesta)")
public class EventResponseDTO {

    @Schema(description = "ID único del evento", example = "1")
    private Long idEvent;

    @Schema(description = "Título del evento", example = "Festival de Música Indie 2026")
    private String title;

    @Schema(description = "Descripción detallada del evento", example = "Un festival increíble con las mejores bandas indie del momento")
    private String description;

    @Schema(description = "Número de entradas disponibles", example = "500")
    private Integer availableTickets;

    @Schema(description = "Ubicación del evento", example = "Auditorio Nacional, Ciudad de México")
    private String location;

    @Schema(description = "Fecha y hora de inicio", example = "2026-06-15T20:00:00")
    private LocalDateTime startDate;

    @Schema(description = "Fecha y hora de fin", example = "2026-06-15T23:59:59")
    private LocalDateTime endDate;

    @Schema(description = "Nombre del organizador del evento", example = "Rock Productions S.A.")
    private String organized;

    @Schema(description = "Precio de la entrada en euros", example = "45.50")
    private Double price;

    @Schema(description = "Categoría del evento", example = "Música")
    private String category;

    @Schema(description = "Email de contacto del evento", example = "info@festivalmadrid.com")
    private String contactEmail;

    @Schema(description = "Teléfono de contacto", example = "910123456")
    private String contactPhone;

    @Schema(description = "URL de la imagen promocional", example = "https://example.com/imagen-evento.jpg")
    private String urlImage;
}
