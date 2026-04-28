package org.service_booking.booking.config.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI userServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Booking Management API")
                        .description("API REST para gestión completa de usuarios con operaciones CRUD, búsquedas avanzadas y validaciones robustas. Implementada con Arquitectura Hexagonal.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Renzo Iván Ramos de los Ríos & Melanie Gabriela Cárdenas Hidalgo"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8082")
                                .description("Servidor de Desarrollo")));
    }
}
