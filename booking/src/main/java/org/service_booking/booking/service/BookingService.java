package org.service_booking.booking.service;

import org.service_booking.booking.service.model.BookingCreateDTO;
import org.service_booking.booking.service.model.BookingResponseDTO;

import java.util.Collection;

public interface BookingService {

    BookingResponseDTO createBooking(BookingCreateDTO bookingCreateDTO);

    BookingResponseDTO getBookingById(Long id);

    Collection<BookingResponseDTO> getAllBookings();

    Collection<BookingResponseDTO> getBookingsByUserId(Long userId);

    Collection<BookingResponseDTO> getBookingsByEventId(Long eventId);

    Collection<BookingResponseDTO> getBookingsByStatus(String status);

    void confirmBooking(Long bookingId);

    void cancelBooking(Long bookingId);
}
