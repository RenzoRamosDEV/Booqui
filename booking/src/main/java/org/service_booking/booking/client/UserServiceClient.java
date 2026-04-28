package org.service_booking.booking.client;

import lombok.extern.slf4j.Slf4j;
import org.service_booking.booking.service.model.UserResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;

    private final String userServiceUrl;

    public UserServiceClient(
            RestTemplate restTemplate,
            @Value("${service.user.url}") String userServiceUrl) {
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
    }

    public UserResponseDTO getUserById(Long userId) {
        String url = userServiceUrl + "/" + userId;
        log.info("Llamando al User Service: {}", url);
        
        try {
            UserResponseDTO user = restTemplate.getForObject(url, UserResponseDTO.class);
            log.info("Usuario obtenido exitosamente: {}", user);
            return user;
        } catch (Exception e) {
            log.error("Error al obtener usuario con ID {}: {}", userId, e.getMessage());
            throw new RuntimeException("Error al obtener usuario con ID: " + userId, e);
        }
    }
}
