package org.service_booking.booking.client;

import lombok.extern.slf4j.Slf4j;
import org.service_booking.booking.service.model.EventResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class EventServiceClient {

    private final RestTemplate restTemplate;

    private final String eventServiceUrl;

    public EventServiceClient(
            RestTemplate restTemplate,
            @Value("${service.event.url}") String eventServiceUrl) {
        this.restTemplate = restTemplate;
        this.eventServiceUrl = eventServiceUrl;
    }

    public EventResponseDTO getEventById(Long eventId) {
        String url = eventServiceUrl + "/" + eventId;
        log.info("Llamando al Event Service: {}", url);
        
        try {
            EventResponseDTO event = restTemplate.getForObject(url, EventResponseDTO.class);
            log.info("Evento obtenido exitosamente: {}", event);
            return event;
        } catch (Exception e) {
            log.error("Error al obtener evento con ID {}: {}", eventId, e.getMessage());
            throw new RuntimeException("Error al obtener evento con ID: " + eventId, e);
        }
    }
}
