package org.service_payment.payment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
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

    /**
     * Decrementa el stock de tickets de un evento.
     * @param eventId ID del evento
     * @param quantity Cantidad de tickets a decrementar
     */
    public void decrementStock(Long eventId, Integer quantity) {
        String url = eventServiceUrl + "/" + eventId + "/stock?quantity=" + quantity;
        try {
            log.info("Decrementando stock del evento ID: {} en {} tickets", eventId, quantity);
            restTemplate.exchange(url, HttpMethod.PATCH, HttpEntity.EMPTY, Void.class);
            log.info("Stock decrementado exitosamente");
        } catch (Exception e) {
            log.error("Error al decrementar stock del evento: {}", e.getMessage());
            throw new RuntimeException("No se pudo decrementar el stock en Event Service: " + e.getMessage());
        }
    }
}
