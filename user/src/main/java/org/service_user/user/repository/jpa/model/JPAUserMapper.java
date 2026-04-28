package org.service_user.user.repository.jpa.model;

import org.mapstruct.Mapper;
import org.service_user.user.repository.model.RepositoryUserModel;

import java.util.Collection;

@Mapper(componentModel = "spring")
public interface JPAUserMapper {

    /**
     * Convierte un modelo JPA a modelo de repositorio (dominio).
     */
    RepositoryUserModel toRepositoryUserModel(JPAUserModel jpaUserModel);

    /**
     * Convierte un modelo de repositorio (dominio) a modelo JPA.
     */
    JPAUserModel toJPAUserModel(RepositoryUserModel repositoryUserModel);

    /**
     * Convierte una colección de modelos JPA a colección de modelos de repositorio.
     */
    Collection<RepositoryUserModel> toRepositoryModel(Collection<JPAUserModel> jpaUserModels);

}

