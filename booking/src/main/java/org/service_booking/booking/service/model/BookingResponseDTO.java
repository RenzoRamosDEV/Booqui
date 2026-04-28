package org.service_booking.booking.service.model;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class BookingResponseDTO {

    private Long bookingId;

    // User information
    private Long userId;

    private String userFirstName;

    private String userLastName;

    private String userEmail;

    // Event information
    private Long eventId;

    private String eventTitle;

    private String eventDescription;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventStartDate;
    
    private String eventLocation;

    // Booking details
    private Integer ticketQuantity;

    private BigDecimal basePrice;

    private BigDecimal totalPrice;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime purchaseDate;
    
    private String status;
}
