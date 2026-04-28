package org.service_event.event.service;

import org.service_event.event.service.model.*;
import java.util.Collection;
import java.util.Optional;

public interface EventService {

    EventResponseDTO createEvent(EventCreateDTO eventCreateDTO);

    Collection<EventResponseDTO> getAllEvents();

    Optional<EventResponseDTO> getEventById(Long id);

    Optional<EventResponseDTO> getEventByContactEmail(String contactEmail);

    Collection<EventResponseDTO> getEventsByTitle(String title);

    Collection<EventResponseDTO> getEventsByCategory(String category);

    Collection<EventResponseDTO> getEventsByLocation(String location);

    Collection<EventResponseDTO> getEventsByOrganized(String organized);

    EventResponseDTO updateEvent(String contactEmail, EventUpdateDTO eventUpdateDTO);

    void deleteEvent(String contactEmail);

    boolean existsByContactEmail(String contactEmail);

    void decrementStock(Long eventId, Integer quantity);
}
