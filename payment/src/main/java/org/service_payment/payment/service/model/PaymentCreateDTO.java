package org.service_payment.payment.service.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Datos para crear un pago")
public class PaymentCreateDTO {

    @Schema(description = "ID de la reserva a pagar", example = "1", required = true)
    @NotNull(message = "El ID de la reserva es requerido")
    private Long bookingId;

    @Schema(description = "ID del usuario", example = "1", required = true)
    @NotNull(message = "El ID del usuario es requerido")
    private Long userId;

    @Schema(description = "ID del evento", example = "1", required = true)
    @NotNull(message = "El ID del evento es requerido")
    private Long eventId;

    @Schema(description = "Cantidad de tickets", example = "2", required = true)
    @NotNull(message = "La cantidad de tickets es requerida")
    @Min(value = 1, message = "La cantidad de tickets debe ser al menos 1")
    private Integer ticketQuantity;

    @Schema(description = "Precio total a pagar", example = "100.00", required = true)
    @NotNull(message = "El precio total es requerido")
    @Min(value = 0, message = "El precio total debe ser mayor o igual a 0")
    private BigDecimal totalPrice;

    @Schema(description = "Método de pago", example = "CREDIT_CARD", required = true, 
            allowableValues = {"CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "BANK_TRANSFER"})
    @NotNull(message = "El método de pago es requerido")
    @Pattern(regexp = "CREDIT_CARD|DEBIT_CARD|PAYPAL|BANK_TRANSFER", 
             message = "Método de pago inválido")
    private String paymentMethod;

    @Schema(description = "Número de tarjeta (solo simulación)", example = "4111111111111111")
    private String cardNumber;

    @Schema(description = "CVV de la tarjeta (solo simulación)", example = "123")
    private String cvv;
}
