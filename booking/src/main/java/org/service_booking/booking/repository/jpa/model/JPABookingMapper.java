package org.service_booking.booking.repository.jpa.model;

import org.mapstruct.Mapper;
import org.service_booking.booking.repository.model.RepositoryBookingModel;

import java.util.Collection;

@Mapper(componentModel = "spring")
public interface JPABookingMapper {

    /**
     * Convierte un modelo JPA a modelo de repositorio (dominio).
     */
    RepositoryBookingModel toRepositoryBookingModel(JPABookingModel jpaBookingModel);

    /**
     * Convierte un modelo de repositorio (dominio) a modelo JPA.
     */
    JPABookingModel toJPABookingModel(RepositoryBookingModel repositoryBookingModel);

    /**
     * Convierte una colección de modelos JPA a colección de modelos de repositorio.
     */
    Collection<RepositoryBookingModel> toRepositoryModel(Collection<JPABookingModel> jpaBookingModels);
}
