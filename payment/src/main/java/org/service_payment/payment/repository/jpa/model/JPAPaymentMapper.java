package org.service_payment.payment.repository.jpa.model;

import org.mapstruct.Mapper;
import org.service_payment.payment.repository.model.RepositoryPaymentModel;

import java.util.Collection;

@Mapper(componentModel = "spring")
public interface JPAPaymentMapper {

    /**
     * Convierte un modelo JPA a modelo de repositorio (dominio).
     */
    RepositoryPaymentModel toRepositoryPaymentModel(JPAPaymentModel jpaPaymentModel);

    /**
     * Convierte un modelo de repositorio (dominio) a modelo JPA.
     */
    JPAPaymentModel toJPAPaymentModel(RepositoryPaymentModel repositoryPaymentModel);

    /**
     * Convierte una colección de modelos JPA a colección de modelos de repositorio.
     */
    Collection<RepositoryPaymentModel> toRepositoryModel(Collection<JPAPaymentModel> jpaPaymentModels);
}
