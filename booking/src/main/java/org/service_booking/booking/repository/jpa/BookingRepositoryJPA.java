package org.service_booking.booking.repository.jpa;

import org.mapstruct.factory.Mappers;
import org.service_booking.booking.repository.BookingRepository;
import org.service_booking.booking.repository.jpa.model.JPABookingMapper;
import org.service_booking.booking.repository.jpa.model.JPABookingModel;
import org.service_booking.booking.repository.model.RepositoryBookingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface BookingRepositoryJPA extends BookingRepository, JpaRepository<JPABookingModel, Long> {

    JPABookingMapper BOOKING_MAPPER = Mappers.getMapper(JPABookingMapper.class);


    Collection<JPABookingModel> findJPAByUserId(Long userId);

    Collection<JPABookingModel> findJPAByEventId(Long eventId);

    Collection<JPABookingModel> findJPAByStatus(String status);

    @Override
    default RepositoryBookingModel save(RepositoryBookingModel booking) {
        if (booking == null) {
            throw new IllegalArgumentException("La reserva no puede ser nula");
        }
        JPABookingModel jpaBookingModel = BOOKING_MAPPER.toJPABookingModel(booking);
        JPABookingModel savedEntity = this.save(jpaBookingModel);
        return BOOKING_MAPPER.toRepositoryBookingModel(savedEntity);
    }

    @Override
    default Optional<RepositoryBookingModel> findBookingById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return this.findById(id)
                .map(BOOKING_MAPPER::toRepositoryBookingModel);
    }

    @Override
    default Collection<RepositoryBookingModel> findAllBookings() {
        Collection<JPABookingModel> persisted = this.findAll();
        return BOOKING_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryBookingModel> findBookingsByUserId(Long userId) {
        if (userId == null) {
            return new ArrayList<>();
        }
        Collection<JPABookingModel> persisted = this.findJPAByUserId(userId);
        return BOOKING_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryBookingModel> findBookingsByEventId(Long eventId) {
        if (eventId == null) {
            return new ArrayList<>();
        }
        Collection<JPABookingModel> persisted = this.findJPAByEventId(eventId);
        return BOOKING_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryBookingModel> findBookingsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPABookingModel> persisted = this.findJPAByStatus(status);
        return BOOKING_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default void deleteBookingById(Long id) {
        if (id != null) {
            this.deleteById(id);
        }
    }

    @Override
    default boolean existsBookingById(Long id) {
        if (id == null) {
            return false;
        }
        return this.existsById(id);
    }
}
