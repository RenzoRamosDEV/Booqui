package org.service_payment.payment.service;

import org.service_payment.payment.service.model.PaymentCreateDTO;
import org.service_payment.payment.service.model.PaymentResponseDTO;

import java.util.Collection;

public interface PaymentService {

    PaymentResponseDTO processPayment(PaymentCreateDTO paymentCreateDTO);

    PaymentResponseDTO getPaymentById(Long id);

    Collection<PaymentResponseDTO> getAllPayments();

    Collection<PaymentResponseDTO> getPaymentsByUserId(Long userId);

    Collection<PaymentResponseDTO> getPaymentsByEventId(Long eventId);

    Collection<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId);

    Collection<PaymentResponseDTO> getPaymentsByStatus(String status);
}
