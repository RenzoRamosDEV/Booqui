package org.service_booking.booking.repository.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryBookingModel {

    private Long bookingId;

    // User snapshot data
    private Long userId;

    private String userFirstName;

    private String userLastName;

    private String userEmail;

    // Event snapshot data
    private Long eventId;

    private String eventTitle;

    private String eventDescription;

    private LocalDateTime eventStartDate;

    private String eventLocation;

    // Booking details
    private Integer ticketQuantity;

    private BigDecimal basePrice;

    private BigDecimal totalPrice;

    private LocalDateTime purchaseDate;

    private String status;
}
