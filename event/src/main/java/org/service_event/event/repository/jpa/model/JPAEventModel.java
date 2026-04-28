package org.service_event.event.repository.jpa.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Table(name = "events")
@Entity(name = "Event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JPAEventModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_event")
    private Long idEvent;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "available_tickets", nullable = false)
    private Integer availableTickets;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false, length = 100)
    private String organized;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "contact_email", nullable = false, unique = true, length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false, length = 15)
    private String contactPhone;

    @Column(name = "url_image", length = 500)
    private String urlImage;
}
