package org.service_event.event.repository.jpa.model;

import org.mapstruct.Mapper;
import org.service_event.event.repository.model.RepositoryEventModel;
import java.util.Collection;

@Mapper(componentModel = "spring")
public interface JPAEventMapper {

    /**
     * Convierte un modelo JPA a modelo de repositorio (dominio).
     */
    RepositoryEventModel toRepositoryEventModel(JPAEventModel jpaEventModel);

    /**
     * Convierte un modelo de repositorio (dominio) a modelo JPA.
     */
    JPAEventModel toJPAEventModel(RepositoryEventModel repositoryEventModel);

    /**
     * Convierte una colección de modelos JPA a colección de modelos de repositorio.
     */
    Collection<RepositoryEventModel> toRepositoryModel(Collection<JPAEventModel> jpaEventModels);
}
