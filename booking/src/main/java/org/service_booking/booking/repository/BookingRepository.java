package org.service_booking.booking.repository;

import org.service_booking.booking.repository.model.RepositoryBookingModel;

import java.util.Collection;
import java.util.Optional;

public interface BookingRepository {

    RepositoryBookingModel save(RepositoryBookingModel booking);

    Optional<RepositoryBookingModel> findBookingById(Long id);

    Collection<RepositoryBookingModel> findAllBookings();

    Collection<RepositoryBookingModel> findBookingsByUserId(Long userId);

    Collection<RepositoryBookingModel> findBookingsByEventId(Long eventId);

    Collection<RepositoryBookingModel> findBookingsByStatus(String status);

    void deleteBookingById(Long id);

    boolean existsBookingById(Long id);
}
