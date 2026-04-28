package org.service_event.event.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_event.event.repository.EventRepository;
import org.service_event.event.repository.model.RepositoryEventModel;
import org.service_event.event.service.EventService;
import org.service_event.event.service.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final ServiceEventMapper serviceEventMapper;

    @Override
    @Transactional
    public EventResponseDTO createEvent(EventCreateDTO eventCreateDTO) {
        log.debug("Creando evento: {}",
                  eventCreateDTO != null ? eventCreateDTO.getTitle() : "null");

        if (eventCreateDTO == null) {
            throw new IllegalArgumentException("Los datos del evento no pueden ser nulos");
        }

        if (eventRepository.existsByContactEmail(eventCreateDTO.getContactEmail())) {
            throw new IllegalStateException(
                "El email de contacto ya está registrado: " + eventCreateDTO.getContactEmail()
            );
        }

        if (eventCreateDTO.getEndDate().isBefore(eventCreateDTO.getStartDate())) {
            throw new IllegalArgumentException(
                "La fecha de fin no puede ser anterior a la fecha de inicio"
            );
        }

        RepositoryEventModel repositoryEventModel = serviceEventMapper.toRepositoryEventModel(eventCreateDTO);
        RepositoryEventModel savedEvent = eventRepository.save(repositoryEventModel);
        
        log.info("Evento creado exitosamente con ID: {}", savedEvent.getIdEvent());
        return serviceEventMapper.toEventResponseDTO(savedEvent);
    }

    @Override
    public Collection<EventResponseDTO> getAllEvents() {
        log.debug("Obteniendo todos los eventos");
        Collection<RepositoryEventModel> events = eventRepository.findAllEvents();
        log.debug("Se encontraron {} eventos", events.size());
        return serviceEventMapper.toEventResponseDTOCollection(events);
    }

    @Override
    public Optional<EventResponseDTO> getEventById(Long id) {
        log.debug("Buscando evento por ID: {}", id);
        
        if (id == null) {
            log.warn("getEventById llamado con ID nulo");
            return Optional.empty();
        }

        return eventRepository.findEventById(id)
                .map(event -> {
                    log.debug("Evento encontrado con ID: {}", id);
                    return serviceEventMapper.toEventResponseDTO(event);
                });
    }

    @Override
    public Optional<EventResponseDTO> getEventByContactEmail(String contactEmail) {
        log.debug("Buscando evento por email: {}", contactEmail);
        
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            log.warn("getEventByContactEmail llamado con email nulo o vacío");
            return Optional.empty();
        }

        return eventRepository.findEventByContactEmail(contactEmail)
                .map(event -> {
                    log.debug("Evento encontrado con email: {}", contactEmail);
                    return serviceEventMapper.toEventResponseDTO(event);
                });
    }

    @Override
    public Collection<EventResponseDTO> getEventsByTitle(String title) {
        log.debug("Buscando eventos por título: {}", title);
        
        if (title == null || title.trim().isEmpty()) {
            log.warn("getEventsByTitle llamado con título nulo o vacío");
            return serviceEventMapper.toEventResponseDTOCollection(
                eventRepository.findAllEvents()
            );
        }

        Collection<RepositoryEventModel> events = eventRepository.findEventsByTitle(title);
        log.debug("Se encontraron {} eventos con título: {}", events.size(), title);
        return serviceEventMapper.toEventResponseDTOCollection(events);
    }

    @Override
    public Collection<EventResponseDTO> getEventsByCategory(String category) {
        log.debug("Buscando eventos por categoría: {}", category);
        
        if (category == null || category.trim().isEmpty()) {
            log.warn("getEventsByCategory llamado con categoría nula o vacía");
            return serviceEventMapper.toEventResponseDTOCollection(
                eventRepository.findAllEvents()
            );
        }

        Collection<RepositoryEventModel> events = eventRepository.findEventsByCategory(category);
        log.debug("Se encontraron {} eventos con categoría: {}", events.size(), category);
        return serviceEventMapper.toEventResponseDTOCollection(events);
    }

    @Override
    public Collection<EventResponseDTO> getEventsByLocation(String location) {
        log.debug("Buscando eventos por ubicación: {}", location);
        
        if (location == null || location.trim().isEmpty()) {
            log.warn("getEventsByLocation llamado con ubicación nula o vacía");
            return serviceEventMapper.toEventResponseDTOCollection(
                eventRepository.findAllEvents()
            );
        }

        Collection<RepositoryEventModel> events = eventRepository.findEventsByLocation(location);
        log.debug("Se encontraron {} eventos en ubicación: {}", events.size(), location);
        return serviceEventMapper.toEventResponseDTOCollection(events);
    }

    @Override
    public Collection<EventResponseDTO> getEventsByOrganized(String organized) {
        log.debug("Buscando eventos por organizador: {}", organized);
        
        if (organized == null || organized.trim().isEmpty()) {
            log.warn("getEventsByOrganized llamado con organizador nulo o vacío");
            return serviceEventMapper.toEventResponseDTOCollection(
                eventRepository.findAllEvents()
            );
        }

        Collection<RepositoryEventModel> events = eventRepository.findEventsByOrganized(organized);
        log.debug("Se encontraron {} eventos organizados por: {}", events.size(), organized);
        return serviceEventMapper.toEventResponseDTOCollection(events);
    }

    @Override
    @Transactional
    public EventResponseDTO updateEvent(String contactEmail, EventUpdateDTO eventUpdateDTO) {
        log.debug("Actualizando evento con email: {}", contactEmail);

        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("El email de contacto no puede ser nulo o vacío");
        }
        if (eventUpdateDTO == null) {
            throw new IllegalArgumentException("Los datos de actualización no pueden ser nulos");
        }

        RepositoryEventModel existingEvent = eventRepository.findEventByContactEmail(contactEmail)
                .orElseThrow(() -> new IllegalStateException("Evento no encontrado con email: " + contactEmail));

        if (eventUpdateDTO.getContactEmail() != null && 
            !eventUpdateDTO.getContactEmail().equals(existingEvent.getContactEmail()) &&
            eventRepository.existsByContactEmail(eventUpdateDTO.getContactEmail())) {
            throw new IllegalStateException(
                "El email de contacto ya está registrado: " + eventUpdateDTO.getContactEmail()
            );
        }

        if (eventUpdateDTO.getStartDate() != null && eventUpdateDTO.getEndDate() != null) {
            if (eventUpdateDTO.getEndDate().isBefore(eventUpdateDTO.getStartDate())) {
                throw new IllegalArgumentException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio"
                );
            }
        } else if (eventUpdateDTO.getStartDate() != null && existingEvent.getEndDate() != null) {
            if (existingEvent.getEndDate().isBefore(eventUpdateDTO.getStartDate())) {
                throw new IllegalArgumentException(
                    "La nueva fecha de inicio no puede ser posterior a la fecha de fin existente"
                );
            }
        } else if (eventUpdateDTO.getEndDate() != null && existingEvent.getStartDate() != null) {
            if (eventUpdateDTO.getEndDate().isBefore(existingEvent.getStartDate())) {
                throw new IllegalArgumentException(
                    "La nueva fecha de fin no puede ser anterior a la fecha de inicio existente"
                );
            }
        }

        if (eventUpdateDTO.getAvailableTickets() != null && eventUpdateDTO.getAvailableTickets() < 0) {
            throw new IllegalArgumentException("El número de tickets no puede ser negativo");
        }

        serviceEventMapper.updateRepositoryEventModelFromDTO(eventUpdateDTO, existingEvent);

        RepositoryEventModel updatedEvent = eventRepository.save(existingEvent);
        
        log.info("Evento actualizado exitosamente con email: {}", contactEmail);
        return serviceEventMapper.toEventResponseDTO(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(String contactEmail) {
        log.debug("Eliminando evento con email: {}", contactEmail);
        
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("El email de contacto no puede ser nulo o vacío");
        }

        RepositoryEventModel event = eventRepository.findEventByContactEmail(contactEmail)
                .orElseThrow(() -> new IllegalStateException("Evento no encontrado con email: " + contactEmail));

        eventRepository.delete(event);
        log.info("Evento eliminado exitosamente con email: {}", contactEmail);
    }

    @Override
    public boolean existsByContactEmail(String contactEmail) {
        log.debug("Verificando si existe email: {}", contactEmail);
        
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            return false;
        }

        return eventRepository.existsByContactEmail(contactEmail);
    }

    @Override
    @Transactional
    public void decrementStock(Long eventId, Integer quantity) {
        log.info("Decrementando stock del evento ID: {} en {} tickets", eventId, quantity);
        
        if (eventId == null) {
            throw new IllegalArgumentException("El ID del evento no puede ser nulo");
        }
        
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        RepositoryEventModel event = eventRepository.findEventById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado con ID: " + eventId));

        if (event.getAvailableTickets() == null) {
            throw new RuntimeException("El evento no tiene stock configurado");
        }

        if (event.getAvailableTickets() < quantity) {
            throw new RuntimeException(
                String.format("Stock insuficiente. Disponibles: %d, Solicitados: %d", 
                    event.getAvailableTickets(), quantity)
            );
        }

        event.setAvailableTickets(event.getAvailableTickets() - quantity);
        eventRepository.save(event);
        
        log.info("Stock actualizado exitosamente. Nuevo stock: {}", event.getAvailableTickets());
    }
}
