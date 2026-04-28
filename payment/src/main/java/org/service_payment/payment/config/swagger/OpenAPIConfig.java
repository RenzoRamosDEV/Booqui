package org.service_payment.payment.config.swagger;

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
    public OpenAPI paymentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Payment Management API")
                        .description("API REST para procesamiento de pagos, integración con servicios de reservas y eventos. Simula transacciones, actualiza stock y confirma reservas.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Renzo Iván Ramos de los Ríos & Melanie Gabriela Cárdenas Hidalgo"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8083")
                                .description("Servidor de Desarrollo")));
    }
}
