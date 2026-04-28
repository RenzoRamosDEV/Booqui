package org.service_payment.payment.repository.model;

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
public class RepositoryPaymentModel {

    private Long paymentId;

    private Long bookingId;

    private Long userId;

    private Long eventId;

    private Integer ticketQuantity;

    private BigDecimal totalPrice;

    private String paymentMethod;

    private String status;

    private String transactionId;

    private String errorMessage;

    private LocalDateTime paymentDate;

    private LocalDateTime creationDate;
}
