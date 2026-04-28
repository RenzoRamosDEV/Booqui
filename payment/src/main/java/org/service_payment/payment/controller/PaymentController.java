package org.service_payment.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_payment.payment.annotation.ApiResponsesAnnotations.*;
import org.service_payment.payment.service.PaymentService;
import org.service_payment.payment.service.model.PaymentCreateDTO;
import org.service_payment.payment.service.model.PaymentResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@Tag(name = "Payments", description = "API de gestión de pagos - Procesamiento de pagos, actualización de stock y confirmación de reservas")
@RestController
@RequestMapping("api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(
        summary = "Procesar un pago", 
        description = "Procesa un pago: valida los datos, simula transacción, actualiza stock en Event Service y confirma la reserva en Booking Service si es aprobado"
    )
    @CreatedResponse
    @BadRequestResponse
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> processPayment(@Valid @RequestBody PaymentCreateDTO paymentCreateDTO) {
        log.info("POST /payments - Recibida solicitud de pago: {}", paymentCreateDTO);
        PaymentResponseDTO response = paymentService.processPayment(paymentCreateDTO);
        log.info("Pago procesado exitosamente con ID: {} y estado: {}", response.getPaymentId(), response.getStatus());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Obtener pago por ID", 
        description = "Obtiene los detalles completos de un pago específico por su ID"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        log.info("GET /payments/{} - Obteniendo pago", id);
        PaymentResponseDTO response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Obtener todos los pagos", 
        description = "Obtiene una lista de todos los pagos registrados en el sistema"
    )
    @OkResponse
    @GetMapping
    public ResponseEntity<Collection<PaymentResponseDTO>> getAllPayments() {
        log.info("GET /payments - Obteniendo todos los pagos");
        Collection<PaymentResponseDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @Operation(
        summary = "Obtener pagos por usuario", 
        description = "Obtiene todos los pagos realizados por un usuario específico"
    )
    @OkResponse
    @GetMapping("/user/{userId}")
    public ResponseEntity<Collection<PaymentResponseDTO>> getPaymentsByUserId(@PathVariable Long userId) {
        log.info("GET /payments/user/{} - Obteniendo pagos del usuario", userId);
        Collection<PaymentResponseDTO> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }

    @Operation(
        summary = "Obtener pagos por evento", 
        description = "Obtiene todos los pagos realizados para un evento específico"
    )
    @OkResponse
    @GetMapping("/event/{eventId}")
    public ResponseEntity<Collection<PaymentResponseDTO>> getPaymentsByEventId(@PathVariable Long eventId) {
        log.info("GET /payments/event/{} - Obteniendo pagos del evento", eventId);
        Collection<PaymentResponseDTO> payments = paymentService.getPaymentsByEventId(eventId);
        return ResponseEntity.ok(payments);
    }

    @Operation(
        summary = "Obtener pagos por reserva", 
        description = "Obtiene todos los pagos asociados a una reserva específica"
    )
    @OkResponse
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Collection<PaymentResponseDTO>> getPaymentsByBookingId(@PathVariable Long bookingId) {
        log.info("GET /payments/booking/{} - Obteniendo pagos de la reserva", bookingId);
        Collection<PaymentResponseDTO> payments = paymentService.getPaymentsByBookingId(bookingId);
        return ResponseEntity.ok(payments);
    }

    @Operation(
        summary = "Obtener pagos por estado", 
        description = "Obtiene todos los pagos que tienen un estado específico (ej: APPROVED, REJECTED, PENDING)"
    )
    @OkResponse
    @GetMapping("/status/{status}")
    public ResponseEntity<Collection<PaymentResponseDTO>> getPaymentsByStatus(@PathVariable String status) {
        log.info("GET /payments/status/{} - Obteniendo pagos con estado", status);
        Collection<PaymentResponseDTO> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }

    @Operation(
        summary = "Health check", 
        description = "Verifica que el servicio está activo y funcionando"
    )
    @StandardOkResponse
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment Service está activo");
    }
}
