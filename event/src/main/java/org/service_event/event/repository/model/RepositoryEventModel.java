package org.service_event.event.repository.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryEventModel {

    private Long idEvent;

    private String title;

    private String description;

    private Integer availableTickets;

    private String location;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String organized;

    private Double price;

    private String category;

    private String contactEmail;

    private String contactPhone;

    private String urlImage;
}
