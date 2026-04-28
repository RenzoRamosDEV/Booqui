package org.service_event.event.controller;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_event.event.annotation.ApiResponsesAnnotations.*;
import org.service_event.event.service.EventService;
import org.service_event.event.service.model.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@Tag(name = "Events", description = "API de gestión de eventos - Operaciones CRUD y búsquedas avanzadas")
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;

    @Operation(
        summary = "Crear nuevo evento",
        description = "Crea un nuevo evento en el sistema con validaciones de email único, fechas válidas y datos obligatorios"
    )
    @CreatedResponse
    @BadRequestResponse
    @ConflictResponse
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventCreateDTO eventCreateDTO) {
        log.info("POST /api/events - creando nuevo evento");
        EventResponseDTO createdEvent = eventService.createEvent(eventCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @Operation(
        summary = "Obtener todos los eventos",
        description = "Retorna la lista completa de eventos registrados en el sistema"
    )
    @OkResponse
    @GetMapping
    public ResponseEntity<Collection<EventResponseDTO>> getAllEvents() {
        log.info("GET /api/events - Recuperando todos los eventos");
        Collection<EventResponseDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @Operation(
        summary = "Obtener evento por ID",
        description = "Busca y retorna un evento por su ID"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        log.info("GET /api/events/{} - Recuperando evento por ID", id);
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Obtener evento por email de contacto",
        description = "Busca y retorna un evento por su dirección de email de contacto"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/email/{email}")
    public ResponseEntity<EventResponseDTO> getEventByContactEmail(@PathVariable String email) {
        log.info("GET /api/events/email/{} - Recuperando evento por email", email);
        return eventService.getEventByContactEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Buscar eventos por título",
        description = "Busca eventos cuyo título contenga el texto especificado (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/title")
    public ResponseEntity<Collection<EventResponseDTO>> getEventsByTitle(@RequestParam String title) {
        log.info("GET /api/events/search/title?title={} - Buscando por titulo", title);
        Collection<EventResponseDTO> events = eventService.getEventsByTitle(title);
        return ResponseEntity.ok(events);
    }

    @Operation(
        summary = "Buscar eventos por categoría",
        description = "Retorna todos los eventos que pertenecen a una categoría específica (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/category")
    public ResponseEntity<Collection<EventResponseDTO>> getEventsByCategory(@RequestParam String category) {
        log.info("GET /api/events/search/category?category={} - Buscando por categoria", category);
        Collection<EventResponseDTO> events = eventService.getEventsByCategory(category);
        return ResponseEntity.ok(events);
    }

    @Operation(
        summary = "Buscar eventos por ubicación",
        description = "Busca eventos cuya ubicación contenga el texto especificado (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/location")
    public ResponseEntity<Collection<EventResponseDTO>> getEventsByLocation(@RequestParam String location) {
        log.info("GET /api/events/search/location?location={} - Buscando por localidad", location);
        Collection<EventResponseDTO> events = eventService.getEventsByLocation(location);
        return ResponseEntity.ok(events);
    }

    @Operation(
        summary = "Buscar eventos por organizador",
        description = "Busca eventos cuyo organizador contenga el texto especificado (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/organized")
    public ResponseEntity<Collection<EventResponseDTO>> getEventsByOrganized(@RequestParam String organized) {
        log.info("GET /api/events/search/organized?organized={} - Buscando por organizacion", organized);
        Collection<EventResponseDTO> events = eventService.getEventsByOrganized(organized);
        return ResponseEntity.ok(events);
    }

    @Operation(
        summary = "Actualizar evento por email",
        description = "Actualiza parcialmente un evento existente identificado por su email de contacto. Solo los campos proporcionados serán actualizados"
    )
    @OkResponseSingle
    @BadRequestResponse
    @NotFoundResponse
    @ConflictResponse
    @PutMapping("/email/{email}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable String email,
                                                        @Valid @RequestBody EventUpdateDTO eventUpdateDTO) {
        log.info("PUT /api/events/email/{} - Actualizando evento", email);
        EventResponseDTO updatedEvent = eventService.updateEvent(email, eventUpdateDTO);
        return ResponseEntity.ok(updatedEvent);
    }

    @Operation(
        summary = "Eliminar evento por email",
        description = "Elimina permanentemente un evento del sistema identificado por su email de contacto"
    )
    @NoContentResponse
    @NotFoundResponse
    @DeleteMapping("/email/{email}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String email) {
        log.info("DELETE /api/events/email/{} - Eliminando evento", email);
        eventService.deleteEvent(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Verificar si existe un email de contacto",
        description = "Comprueba si un email de contacto ya está registrado en el sistema"
    )
    @StandardOkResponse
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> existsByContactEmail(@PathVariable String email) {
        log.info("GET /api/events/exists/email/{} - Verificando si el correo electrónico de contacto existe", email);
        boolean exists = eventService.existsByContactEmail(email);
        return ResponseEntity.ok(exists);
    }

    @Operation(
            summary = "Health check",
            description = "Verifica que el servicio está activo y funcionando"
    )
    @StandardOkResponse
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Event Service está activo");
    }

    @Operation(
        summary = "Decrementar stock de tickets",
        description = "Decrementa la cantidad de tickets disponibles para un evento. Usado por Payment Service cuando se confirma un pago"
    )
    @StandardOkResponse
    @BadRequestResponse
    @NotFoundResponse
    @PatchMapping("/{eventId}/stock")
    public ResponseEntity<Void> decrementStock(
            @PathVariable Long eventId,
            @RequestParam Integer quantity) {
        log.info("PATCH /api/events/{}/stock?quantity={} - Decrementando stock", eventId, quantity);
        eventService.decrementStock(eventId, quantity);
        return ResponseEntity.ok().build();
    }
}
