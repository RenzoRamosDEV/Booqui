package org.service_booking.booking.service.model;

import org.mapstruct.Mapper;
import org.service_booking.booking.repository.model.RepositoryBookingModel;

import java.util.Collection;

@Mapper(componentModel = "spring")
public interface ServiceBookingMapper {

    /**
     * Convierte un modelo de repositorio (dominio) a DTO de respuesta.
     */
    BookingResponseDTO toResponseDTO(RepositoryBookingModel repositoryModel);

    /**
     * Convierte una colección de modelos de repositorio a colección de DTOs de respuesta.
     */
    Collection<BookingResponseDTO> toResponseDTOList(Collection<RepositoryBookingModel> repositoryModels);
}
