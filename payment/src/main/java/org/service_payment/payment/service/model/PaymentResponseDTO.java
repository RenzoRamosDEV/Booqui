package org.service_payment.payment.service.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos de respuesta del pago")
public class PaymentResponseDTO {

    @Schema(description = "ID único del pago", example = "1")
    private Long paymentId;

    @Schema(description = "ID de la reserva asociada", example = "1")
    private Long bookingId;

    @Schema(description = "ID del usuario", example = "1")
    private Long userId;

    @Schema(description = "ID del evento", example = "1")
    private Long eventId;

    @Schema(description = "Cantidad de tickets", example = "2")
    private Integer ticketQuantity;

    @Schema(description = "Precio total pagado", example = "100.00")
    private BigDecimal totalPrice;

    @Schema(description = "Método de pago utilizado", example = "CREDIT_CARD")
    private String paymentMethod;

    @Schema(description = "Estado del pago", example = "APPROVED")
    private String status;

    @Schema(description = "ID de transacción", example = "TXN-20260221-123456")
    private String transactionId;

    @Schema(description = "Mensaje de error (si el pago falló)", example = "null")
    private String errorMessage;

    @Schema(description = "Fecha y hora del pago", example = "2026-02-21T14:30:00")
    private LocalDateTime paymentDate;

    @Schema(description = "Fecha y hora de creación del registro", example = "2026-02-21T14:30:00")
    private LocalDateTime creationDate;
}
