package org.service_payment.payment.repository;

import org.service_payment.payment.repository.model.RepositoryPaymentModel;

import java.util.Collection;
import java.util.Optional;

public interface PaymentRepository {

    RepositoryPaymentModel save(RepositoryPaymentModel payment);

    Optional<RepositoryPaymentModel> findPaymentById(Long id);

    Collection<RepositoryPaymentModel> findPaymentsByBookingId(Long bookingId);

    Collection<RepositoryPaymentModel> findAllPayments();

    Collection<RepositoryPaymentModel> findPaymentsByUserId(Long userId);

    Collection<RepositoryPaymentModel> findPaymentsByEventId(Long eventId);

    Collection<RepositoryPaymentModel> findPaymentsByStatus(String status);

    Collection<RepositoryPaymentModel> findPaymentsByPaymentMethod(String paymentMethod);
}
