package org.service_payment.payment.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class BookingServiceClient {

    private final RestTemplate restTemplate;

    private final String bookingServiceUrl;

    public BookingServiceClient(
            RestTemplate restTemplate,
            @Value("${service.booking.url}") String bookingServiceUrl) {
        this.restTemplate = restTemplate;
        this.bookingServiceUrl = bookingServiceUrl;
    }

    /**
     * Confirma la reserva (cambia estado a CONFIRMADO).
     */
    public void confirmBooking(Long bookingId) {
        String url = bookingServiceUrl + "/" + bookingId + "/confirm";
        try {
            log.info("Confirmando reserva ID: {} en Booking Service", bookingId);
            restTemplate.exchange(url, HttpMethod.PATCH, HttpEntity.EMPTY, Void.class);
            log.info("Reserva confirmada exitosamente");
        } catch (Exception e) {
            log.error("Error al confirmar reserva: {}", e.getMessage());
            throw new RuntimeException("No se pudo confirmar la reserva en Booking Service: " + e.getMessage());
        }
    }

    /**
     * Cancela la reserva (cambia estado a CANCELADO).
     */
    public void cancelBooking(Long bookingId) {
        String url = bookingServiceUrl + "/" + bookingId + "/cancel";
        try {
            log.info("Cancelando reserva ID: {} en Booking Service", bookingId);
            restTemplate.exchange(url, HttpMethod.PATCH, HttpEntity.EMPTY, Void.class);
            log.info("Reserva cancelada exitosamente");
        } catch (Exception e) {
            log.error("Error al cancelar reserva: {}", e.getMessage());
            throw new RuntimeException("No se pudo cancelar la reserva en Booking Service: " + e.getMessage());
        }
    }
}
