package org.service_event.event.repository;

import org.service_event.event.repository.model.RepositoryEventModel;
import java.util.Collection;
import java.util.Optional;

public interface EventRepository {

    RepositoryEventModel save(RepositoryEventModel event);

    Collection<RepositoryEventModel> findAllEvents();

    Optional<RepositoryEventModel> findEventById(Long idEvent);

    Optional<RepositoryEventModel> findEventByContactEmail(String contactEmail);

    boolean existsByContactEmail(String contactEmail);

    Collection<RepositoryEventModel> findEventsByTitle(String title);

    Collection<RepositoryEventModel> findEventsByCategory(String category);

    Collection<RepositoryEventModel> findEventsByLocation(String location);

    Collection<RepositoryEventModel> findEventsByOrganized(String organized);

    void delete(RepositoryEventModel event);
}
