package org.service_payment.payment.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_payment.payment.client.BookingServiceClient;
import org.service_payment.payment.client.EventServiceClient;
import org.service_payment.payment.repository.PaymentRepository;
import org.service_payment.payment.repository.model.RepositoryPaymentModel;
import org.service_payment.payment.service.PaymentService;
import org.service_payment.payment.service.model.PaymentCreateDTO;
import org.service_payment.payment.service.model.PaymentResponseDTO;
import org.service_payment.payment.service.model.ServicePaymentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final EventServiceClient eventServiceClient;
    private final BookingServiceClient bookingServiceClient;
    private final ServicePaymentMapper servicePaymentMapper;

    @Override
    @Transactional
    public PaymentResponseDTO processPayment(PaymentCreateDTO paymentCreateDTO) {
        log.info("Starting payment processing for bookingId: {}, userId: {}, eventId: {}, ticketQuantity: {}",
                paymentCreateDTO.getBookingId(), paymentCreateDTO.getUserId(), 
                paymentCreateDTO.getEventId(), paymentCreateDTO.getTicketQuantity());

        // Step 1: Create payment model with initial PENDING status
        RepositoryPaymentModel paymentModel = RepositoryPaymentModel.builder()
                .bookingId(paymentCreateDTO.getBookingId())
                .userId(paymentCreateDTO.getUserId())
                .eventId(paymentCreateDTO.getEventId())
                .ticketQuantity(paymentCreateDTO.getTicketQuantity())
                .totalPrice(paymentCreateDTO.getTotalPrice())
                .paymentMethod(paymentCreateDTO.getPaymentMethod())
                .status("PENDING")
                .creationDate(LocalDateTime.now())
                .build();

        // Step 2: Save initial payment
        RepositoryPaymentModel savedPayment = paymentRepository.save(paymentModel);
        log.info("Payment registered with ID: {} and status PENDING", savedPayment.getPaymentId());

        try {
            // Step 3: Simulate payment processing
            boolean paymentApproved = simulatePaymentProcessing(paymentCreateDTO);

            if (paymentApproved) {
                // Step 4: If payment approved, decrement event stock
                log.info("Payment approved. Decrementing stock for event ID: {} by {} tickets", 
                        paymentCreateDTO.getEventId(), paymentCreateDTO.getTicketQuantity());
                eventServiceClient.decrementStock(paymentCreateDTO.getEventId(), 
                        paymentCreateDTO.getTicketQuantity());

                // Step 5: Confirm booking
                log.info("Stock decremented successfully. Confirming booking ID: {}", 
                        paymentCreateDTO.getBookingId());
                bookingServiceClient.confirmBooking(paymentCreateDTO.getBookingId());

                // Step 6: Update payment to APPROVED
                savedPayment.setStatus("APPROVED");
                savedPayment.setTransactionId(UUID.randomUUID().toString()); //Crea un ID de transacción simulado
                savedPayment.setPaymentDate(LocalDateTime.now());
                savedPayment = paymentRepository.save(savedPayment);
                log.info("Payment approved successfully with transactionId: {}", savedPayment.getTransactionId());

            } else {
                // Payment rejected
                savedPayment.setStatus("REJECTED");
                savedPayment.setErrorMessage("Payment rejected by simulation");
                savedPayment.setPaymentDate(LocalDateTime.now());
                savedPayment = paymentRepository.save(savedPayment);
                log.warn("Payment rejected for bookingId: {}", paymentCreateDTO.getBookingId());

                // Optional: cancel booking
                bookingServiceClient.cancelBooking(paymentCreateDTO.getBookingId());
            }

        } catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage(), e);
            savedPayment.setStatus("REJECTED");
            savedPayment.setErrorMessage(e.getMessage());
            savedPayment.setPaymentDate(LocalDateTime.now());
            savedPayment = paymentRepository.save(savedPayment);

            try {
                bookingServiceClient.cancelBooking(paymentCreateDTO.getBookingId());
            } catch (Exception ex) {
                log.error("Error canceling booking after payment failure: {}", ex.getMessage());
            }
        }

        return servicePaymentMapper.toResponseDTO(savedPayment);
    }

    /**
     * Simulates payment processing.
     * Simulation rules:
     * - Cards ending in even number: APPROVED
     * - Cards ending in odd number: REJECTED
     * - If no card number, automatically approve (for methods like PAYPAL)
     */
    private boolean simulatePaymentProcessing(PaymentCreateDTO paymentCreateDTO) {
        log.info("Simulating payment processing with method: {}", paymentCreateDTO.getPaymentMethod());

        // Simulate processing delay
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simulation logic based on card number
        if (paymentCreateDTO.getCardNumber() != null && !paymentCreateDTO.getCardNumber().isEmpty()) {
            char lastDigit = paymentCreateDTO.getCardNumber().charAt(paymentCreateDTO.getCardNumber().length() - 1);
            boolean approved = Character.getNumericValue(lastDigit) % 2 == 0;
            log.info("Card ends in: {}. Payment {}", lastDigit, approved ? "APPROVED" : "REJECTED");
            return approved;
        }

        // No card number, approve automatically
        log.info("No card number. Payment APPROVED automatically");
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentById(Long id) {
        log.info("Searching for payment with ID: {}", id);
        RepositoryPaymentModel payment = paymentRepository.findPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));
        return servicePaymentMapper.toResponseDTO(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<PaymentResponseDTO> getAllPayments() {
        log.info("Getting all payments");
        return servicePaymentMapper.toResponseDTOList(paymentRepository.findAllPayments());
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<PaymentResponseDTO> getPaymentsByUserId(Long userId) {
        log.info("Searching for payments by user ID: {}", userId);
        return servicePaymentMapper.toResponseDTOList(paymentRepository.findPaymentsByUserId(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<PaymentResponseDTO> getPaymentsByEventId(Long eventId) {
        log.info("Searching for payments by event ID: {}", eventId);
        return servicePaymentMapper.toResponseDTOList(paymentRepository.findPaymentsByEventId(eventId));
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<PaymentResponseDTO> getPaymentsByBookingId(Long bookingId) {
        log.info("Searching for payments by booking ID: {}", bookingId);
        return servicePaymentMapper.toResponseDTOList(paymentRepository.findPaymentsByBookingId(bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<PaymentResponseDTO> getPaymentsByStatus(String status) {
        log.info("Searching for payments with status: {}", status);
        return servicePaymentMapper.toResponseDTOList(paymentRepository.findPaymentsByStatus(status));
    }
}
