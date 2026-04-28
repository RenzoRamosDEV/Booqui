package org.service_payment.payment.repository.jpa;

import org.mapstruct.factory.Mappers;
import org.service_payment.payment.repository.PaymentRepository;
import org.service_payment.payment.repository.jpa.model.JPAPaymentMapper;
import org.service_payment.payment.repository.jpa.model.JPAPaymentModel;
import org.service_payment.payment.repository.model.RepositoryPaymentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface PaymentRepositoryJPA extends PaymentRepository, JpaRepository<JPAPaymentModel, Long> {

    JPAPaymentMapper PAYMENT_MAPPER = Mappers.getMapper(JPAPaymentMapper.class);

    // JPA custom query methods (return JPAPaymentModel)
    Collection<JPAPaymentModel> findJPAByBookingId(Long bookingId);

    Collection<JPAPaymentModel> findJPAByUserId(Long userId);

    Collection<JPAPaymentModel> findJPAByEventId(Long eventId);

    Collection<JPAPaymentModel> findJPAByStatus(String status);

    Collection<JPAPaymentModel> findJPAByPaymentMethod(String paymentMethod);

    // Default implementations of PaymentRepository methods
    @Override
    default RepositoryPaymentModel save(RepositoryPaymentModel payment) {
        if (payment == null) {
            throw new IllegalArgumentException("El pago no puede ser nulo");
        }
        JPAPaymentModel jpaPaymentModel = PAYMENT_MAPPER.toJPAPaymentModel(payment);
        JPAPaymentModel savedEntity = this.save(jpaPaymentModel);
        return PAYMENT_MAPPER.toRepositoryPaymentModel(savedEntity);
    }

    @Override
    default Optional<RepositoryPaymentModel> findPaymentById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return this.findById(id)
                .map(PAYMENT_MAPPER::toRepositoryPaymentModel);
    }

    @Override
    default Collection<RepositoryPaymentModel> findPaymentsByBookingId(Long bookingId) {
        if (bookingId == null) {
            return new ArrayList<>();
        }
        Collection<JPAPaymentModel> persisted = this.findJPAByBookingId(bookingId);
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryPaymentModel> findAllPayments() {
        Collection<JPAPaymentModel> persisted = this.findAll();
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryPaymentModel> findPaymentsByUserId(Long userId) {
        if (userId == null) {
            return new ArrayList<>();
        }
        Collection<JPAPaymentModel> persisted = this.findJPAByUserId(userId);
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryPaymentModel> findPaymentsByEventId(Long eventId) {
        if (eventId == null) {
            return new ArrayList<>();
        }
        Collection<JPAPaymentModel> persisted = this.findJPAByEventId(eventId);
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryPaymentModel> findPaymentsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPAPaymentModel> persisted = this.findJPAByStatus(status);
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryPaymentModel> findPaymentsByPaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPAPaymentModel> persisted = this.findJPAByPaymentMethod(paymentMethod);
        return PAYMENT_MAPPER.toRepositoryModel(persisted);
    }
}
