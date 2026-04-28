package org.service_event.event.repository.jpa;

import org.mapstruct.factory.Mappers;
import org.service_event.event.repository.EventRepository;
import org.service_event.event.repository.jpa.model.JPAEventMapper;
import org.service_event.event.repository.jpa.model.JPAEventModel;
import org.service_event.event.repository.model.RepositoryEventModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface EventRepositoryJPA extends EventRepository, JpaRepository<JPAEventModel, Long> {

    JPAEventMapper EVENT_MAPPER = Mappers.getMapper(JPAEventMapper.class);


    Collection<JPAEventModel> findJPAByTitleContainingIgnoreCase(String title);

    Collection<JPAEventModel> findJPAByCategoryIgnoreCase(String category);

    Collection<JPAEventModel> findJPAByLocationContainingIgnoreCase(String location);

    Collection<JPAEventModel> findJPAByOrganizedContainingIgnoreCase(String organized);

    Optional<JPAEventModel> findJPAByContactEmail(String contactEmail);

    boolean existsJPAByContactEmail(String contactEmail);


    @Override
    default RepositoryEventModel save(RepositoryEventModel event) {
        if (event == null) {
            throw new IllegalArgumentException("El evento no puede ser nulo");
        }
        JPAEventModel jpaEventModel = EVENT_MAPPER.toJPAEventModel(event);
        JPAEventModel savedEntity = this.save(jpaEventModel);
        return EVENT_MAPPER.toRepositoryEventModel(savedEntity);
    }

    @Override
    default Collection<RepositoryEventModel> findAllEvents() {
        Collection<JPAEventModel> jpaModels = this.findAll();
        return EVENT_MAPPER.toRepositoryModel(jpaModels);
    }

    @Override
    default Optional<RepositoryEventModel> findEventById(Long idEvent) {
        if (idEvent == null) {
            return Optional.empty();
        }
        return this.findById(idEvent)
                .map(EVENT_MAPPER::toRepositoryEventModel);
    }

    @Override
    default Optional<RepositoryEventModel> findEventByContactEmail(String contactEmail) {
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            return Optional.empty();
        }
        return this.findJPAByContactEmail(contactEmail)
                .map(EVENT_MAPPER::toRepositoryEventModel);
    }

    @Override
    default boolean existsByContactEmail(String contactEmail) {
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            return false;
        }
        return this.existsJPAByContactEmail(contactEmail);
    }

    @Override
    default Collection<RepositoryEventModel> findEventsByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return EVENT_MAPPER.toRepositoryModel(this.findJPAByTitleContainingIgnoreCase(title));
    }

    @Override
    default Collection<RepositoryEventModel> findEventsByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return EVENT_MAPPER.toRepositoryModel(this.findJPAByCategoryIgnoreCase(category));
    }

    @Override
    default Collection<RepositoryEventModel> findEventsByLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return EVENT_MAPPER.toRepositoryModel(this.findJPAByLocationContainingIgnoreCase(location));
    }

    @Override
    default Collection<RepositoryEventModel> findEventsByOrganized(String organized) {
        if (organized == null || organized.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return EVENT_MAPPER.toRepositoryModel(this.findJPAByOrganizedContainingIgnoreCase(organized));
    }

    @Override
    default void delete(RepositoryEventModel event) {
        if (event != null && event.getIdEvent() != null) {
            this.deleteById(event.getIdEvent());
        }
    }
}


