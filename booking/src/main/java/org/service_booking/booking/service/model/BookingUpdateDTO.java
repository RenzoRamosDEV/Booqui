package org.service_booking.booking.service.model;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingUpdateDTO {

    @Min(value = 1, message = "La cantidad de tickets debe ser al menos 1")
    private Integer ticketQuantity;

    private String status;
}
