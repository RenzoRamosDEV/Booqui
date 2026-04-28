package org.service_booking.booking.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {

    private Long idUser;

    private String firstName;

    private String lastName;

    private String contactEmail;

    private String role;
}
