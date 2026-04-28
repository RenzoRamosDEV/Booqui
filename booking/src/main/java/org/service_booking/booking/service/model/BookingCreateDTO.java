package org.service_booking.booking.service.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCreateDTO {

    @NotNull(message = "El ID del usuario es requerido")
    private Long userId;

    @NotNull(message = "El ID del evento es requerido")
    private Long eventId;

    @NotNull(message = "La cantidad de tickets es requerida")
    @Min(value = 1, message = "La cantidad de tickets debe ser al menos 1")
    private Integer ticketQuantity;
}
