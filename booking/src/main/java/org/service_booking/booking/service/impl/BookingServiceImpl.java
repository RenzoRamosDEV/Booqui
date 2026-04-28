package org.service_booking.booking.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_booking.booking.client.EventServiceClient;
import org.service_booking.booking.client.UserServiceClient;
import org.service_booking.booking.repository.BookingRepository;
import org.service_booking.booking.repository.model.RepositoryBookingModel;
import org.service_booking.booking.service.BookingService;
import org.service_booking.booking.service.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collection;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    private final UserServiceClient userServiceClient;

    private final EventServiceClient eventServiceClient;

    private final ServiceBookingMapper serviceBookingMapper;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingCreateDTO bookingCreateDTO) {
        log.info("Starting booking process for userId: {}, eventId: {}, ticketQuantity: {}",
                bookingCreateDTO.getUserId(), bookingCreateDTO.getEventId(), bookingCreateDTO.getTicketQuantity());

        // Step 1: Get user information from User Service
        UserResponseDTO user = userServiceClient.getUserById(bookingCreateDTO.getUserId());
        log.info("User retrieved: {} {} ({})", user.getFirstName(), user.getLastName(), user.getContactEmail());

        // Step 2: Get event information from Event Service
        EventResponseDTO event = eventServiceClient.getEventById(bookingCreateDTO.getEventId());
        log.info("Event retrieved: {} - {} at {}", event.getTitle(), event.getStartDate(), event.getLocation());

        // Step 3: Calculate total price
        BigDecimal totalPrice = BigDecimal.valueOf(event.getPrice())
                .multiply(BigDecimal.valueOf(bookingCreateDTO.getTicketQuantity()));
        log.info("Price calculated: {} x {} = {}", 
                event.getPrice(), bookingCreateDTO.getTicketQuantity(), totalPrice);

        // Step 4: Create booking snapshot with all data
        RepositoryBookingModel repositoryModel = RepositoryBookingModel.builder()
                .userId(user.getIdUser())
                .userFirstName(user.getFirstName())
                .userLastName(user.getLastName())
                .userEmail(user.getContactEmail())
                .eventId(event.getIdEvent())
                .eventTitle(event.getTitle())
                .eventDescription(event.getDescription())
                .eventStartDate(event.getStartDate())
                .eventLocation(event.getLocation())
                .ticketQuantity(bookingCreateDTO.getTicketQuantity())
                .basePrice(BigDecimal.valueOf(event.getPrice()))
                .totalPrice(totalPrice)
                .status("PENDING")
                .build();

        // Step 5: Save to database
        RepositoryBookingModel savedModel = bookingRepository.save(repositoryModel);
        log.info("Booking saved successfully with ID: {}", savedModel.getBookingId());

        // Step 6: Build and return response
        return serviceBookingMapper.toResponseDTO(savedModel);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        log.info("Buscando la reserva con ID: {}", id);
        RepositoryBookingModel booking = bookingRepository.findBookingById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID:" + id));
        return serviceBookingMapper.toResponseDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<BookingResponseDTO> getAllBookings() {
        log.info("Obteniendo todas las reservas");
        return serviceBookingMapper.toResponseDTOList(bookingRepository.findAllBookings());
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<BookingResponseDTO> getBookingsByUserId(Long userId) {
        log.info("Buscando reservas del usuario con ID: {}", userId);
        return serviceBookingMapper.toResponseDTOList(bookingRepository.findBookingsByUserId(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<BookingResponseDTO> getBookingsByEventId(Long eventId) {
        log.info("Buscando reservas del evento con ID: {}", eventId);
        return serviceBookingMapper.toResponseDTOList(bookingRepository.findBookingsByEventId(eventId));
    }

    @Override
    @Transactional(readOnly = true)
    public Collection<BookingResponseDTO> getBookingsByStatus(String status) {
        log.info("Buscando reservas del evento con estado: {}", status);
        return serviceBookingMapper.toResponseDTOList(bookingRepository.findBookingsByStatus(status));
    }

    @Override
    @Transactional
    public void confirmBooking(Long bookingId) {
        log.info("Confirmando la reserva con ID: {}", bookingId);
        RepositoryBookingModel booking = bookingRepository.findBookingById(bookingId)
                .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID: " + bookingId));
        
        if ("CONFIRMED".equals(booking.getStatus())) {
            log.warn("La reserva {} ya está confirmada", bookingId);
            return;
        }
        
        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);
        log.info("Reserva {} confirmada correctamente", bookingId);
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        log.info("Cancelando la reserva con ID: {}", bookingId);
        RepositoryBookingModel booking = bookingRepository.findBookingById(bookingId)
                .orElseThrow(() -> new RuntimeException("No se encontró la reserva con ID: " + bookingId));
        
        if ("CANCELLED".equals(booking.getStatus())) {
            log.warn("La reserva {} ya está cancelada", bookingId);
            return;
        }
        
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        log.info("Reserva {} cancelada correctamente", bookingId);
    }
}
