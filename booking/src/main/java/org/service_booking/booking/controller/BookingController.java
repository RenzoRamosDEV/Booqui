package org.service_booking.booking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_booking.booking.annotation.ApiResponsesAnnotations.*;
import org.service_booking.booking.service.BookingService;
import org.service_booking.booking.service.model.BookingCreateDTO;
import org.service_booking.booking.service.model.BookingResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@Tag(name = "Bookings", description = "API de gestión de reservas - Creación de reservas con snapshot inmutable de datos")
@RestController
@RequestMapping("api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    @Operation(
        summary = "Crear una nueva reserva", 
        description = "Crea una nueva reserva capturando un snapshot inmutable de los datos del usuario y evento"
    )
    @CreatedResponse
    @BadRequestResponse
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingCreateDTO bookingCreateDTO) {
        log.info("POST /bookings - Recibida solicitud de reserva: {}", bookingCreateDTO);
        BookingResponseDTO response = bookingService.createBooking(bookingCreateDTO);
        log.info("Reserva creada exitosamente con ID: {}", response.getBookingId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Obtener reserva por ID", 
        description = "Obtiene los detalles completos de una reserva específica por su ID"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        log.info("GET /bookings/{} - Obteniendo reserva", id);
        BookingResponseDTO response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Obtener todas las reservas", 
        description = "Obtiene una lista de todas las reservas registradas en el sistema"
    )
    @OkResponse
    @GetMapping
    public ResponseEntity<Collection<BookingResponseDTO>> getAllBookings() {
        log.info("GET /bookings - Obteniendo todas las reservas");
        Collection<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @Operation(
        summary = "Obtener reservas por usuario", 
        description = "Obtiene todas las reservas realizadas por un usuario específico"
    )
    @OkResponse
    @GetMapping("/user/{userId}")
    public ResponseEntity<Collection<BookingResponseDTO>> getBookingsByUserId(@PathVariable Long userId) {
        log.info("GET /bookings/user/{} - Obteniendo reservas del usuario", userId);
        Collection<BookingResponseDTO> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @Operation(
        summary = "Obtener reservas por evento", 
        description = "Obtiene todas las reservas realizadas para un evento específico"
    )
    @OkResponse
    @GetMapping("/event/{eventId}")
    public ResponseEntity<Collection<BookingResponseDTO>> getBookingsByEventId(@PathVariable Long eventId) {
        log.info("GET /bookings/event/{} - Obteniendo reservas del evento", eventId);
        Collection<BookingResponseDTO> bookings = bookingService.getBookingsByEventId(eventId);
        return ResponseEntity.ok(bookings);
    }

    @Operation(
        summary = "Obtener reservas por estado", 
        description = "Obtiene todas las reservas que tienen un estado específico (ej: CONFIRMED, CANCELLED, PENDING)"
    )
    @OkResponse
    @GetMapping("/status/{status}")
    public ResponseEntity<Collection<BookingResponseDTO>> getBookingsByStatus(@PathVariable String status) {
        log.info("GET /bookings/status/{} - Obteniendo reservas con estado", status);
        Collection<BookingResponseDTO> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }

    @Operation(
        summary = "Health check", 
        description = "Verifica que el servicio está activo y funcionando"
    )
    @StandardOkResponse
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Booking Service está activo");
    }

    @Operation(
        summary = "Confirmar reserva",
        description = "Cambia el estado de una reserva a CONFIRMED. Usado por Payment Service cuando el pago es aprobado"
    )
    @StandardOkResponse
    @NotFoundResponse
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmBooking(@PathVariable Long id) {
        log.info("PATCH /bookings/{}/confirm - Confirmando reserva", id);
        bookingService.confirmBooking(id);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Cancelar reserva",
        description = "Cambia el estado de una reserva a CANCELLED. Usado por Payment Service cuando el pago es rechazado"
    )
    @StandardOkResponse
    @NotFoundResponse
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        log.info("PATCH /bookings/{}/cancel - Cancelando reserva", id);
        bookingService.cancelBooking(id);
        return ResponseEntity.ok().build();
    }
}
