package org.service_user.user.repository;

import org.service_user.user.repository.model.RepositoryUserModel;

import java.util.Collection;
import java.util.Optional;

public interface UserRepository {

    RepositoryUserModel save(RepositoryUserModel user);

    Collection<RepositoryUserModel> findAllUser();

    Optional<RepositoryUserModel> findUserById(Long idUser);

    Optional<RepositoryUserModel> findUserByContactEmail(String contactEmail);

    boolean existsByContactEmail(String contactEmail);

    Collection<RepositoryUserModel> findUserByFirstName(String firstName);

    Collection<RepositoryUserModel> findUserByLastName(String lastName);

    Optional<RepositoryUserModel> findUserByContactPhone(String contactPhone);

    Collection<RepositoryUserModel> findUserByRole(String role);

    Collection<RepositoryUserModel> findUserFirstNameAndLastName(String firstName, String lastName);

    void delete(RepositoryUserModel user);
}
