package org.service_user.user.repository.model;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryUserModel {

    private Long idUser;

    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private String contactPhone;

    private String contactEmail;

    private String password;

    private Role role;

    public enum Role {
        ADMIN,
        CUSTOMER
    }
}
