package org.service_payment.payment.service.model;

import org.mapstruct.Mapper;
import org.service_payment.payment.repository.model.RepositoryPaymentModel;

import java.util.Collection;

@Mapper(componentModel = "spring")
public interface ServicePaymentMapper {

    /**
     * Convierte un modelo de repositorio (dominio) a DTO de respuesta.
     */
    PaymentResponseDTO toResponseDTO(RepositoryPaymentModel repositoryModel);

    /**
     * Convierte una colección de modelos de repositorio a colección de DTOs de respuesta.
     */
    Collection<PaymentResponseDTO> toResponseDTOList(Collection<RepositoryPaymentModel> repositoryModels);
}
