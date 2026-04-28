package org.service_user.user.repository.jpa;

import org.mapstruct.factory.Mappers;
import org.service_user.user.repository.UserRepository;
import org.service_user.user.repository.jpa.model.JPAUserMapper;
import org.service_user.user.repository.jpa.model.JPAUserModel;
import org.service_user.user.repository.model.RepositoryUserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface UserRepositoryJPA extends UserRepository, JpaRepository<JPAUserModel, Long> {

    JPAUserMapper USER_MAPPER = Mappers.getMapper(JPAUserMapper.class);

    Collection<JPAUserModel> findJPAByFirstNameIgnoreCase(String firstName);

    Collection<JPAUserModel> findJPAByLastNameIgnoreCase(String lastName);

    Optional<JPAUserModel> findJPAByContactPhone(String contactPhone);

    Collection<JPAUserModel> findJPAByRole(JPAUserModel.Role role);

    Collection<JPAUserModel> findJPAByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);

    Optional<JPAUserModel> findJPAByContactEmail(String contactEmail);

    boolean existsJPAByContactEmail(String email);



    @Override
    default RepositoryUserModel save(RepositoryUserModel user) {
        if (user == null) {
            throw new IllegalArgumentException("El usuario no puede ser nulo");
        }
        JPAUserModel jpaUserModel = USER_MAPPER.toJPAUserModel(user);
        JPAUserModel savedEntity = this.save(jpaUserModel);
        return USER_MAPPER.toRepositoryUserModel(savedEntity);
    }

    @Override
    default Collection<RepositoryUserModel> findAllUser() {
        Collection<JPAUserModel> persisted = this.findAll();
        return USER_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Optional<RepositoryUserModel> findUserById(Long idUser) {
        if (idUser == null) {
            return Optional.empty();
        }
        return this.findById(idUser)
                .map(USER_MAPPER::toRepositoryUserModel);
    }

    @Override
    default Optional<RepositoryUserModel> findUserByContactEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return this.findJPAByContactEmail(email)
                .map(USER_MAPPER::toRepositoryUserModel);
    }

    @Override
    default boolean existsByContactEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return this.existsJPAByContactEmail(email);
    }

    @Override
    default Collection<RepositoryUserModel> findUserByFirstName(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPAUserModel> persisted = this.findJPAByFirstNameIgnoreCase(firstName);
        return USER_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Collection<RepositoryUserModel> findUserByLastName(String lastName) {
        if (lastName == null || lastName.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPAUserModel> persisted = this.findJPAByLastNameIgnoreCase(lastName);
        return USER_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default Optional<RepositoryUserModel> findUserByContactPhone(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return Optional.empty();
        }
        return this.findJPAByContactPhone(phoneNumber)
                .map(USER_MAPPER::toRepositoryUserModel);
    }

    @Override
    default Collection<RepositoryUserModel> findUserByRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            JPAUserModel.Role roleEnum = JPAUserModel.Role.valueOf(role.toUpperCase());
            Collection<JPAUserModel> persisted = this.findJPAByRole(roleEnum);
            return USER_MAPPER.toRepositoryModel(persisted);
        } catch (IllegalArgumentException e) {
            return new ArrayList<>();
        }
    }

    @Override
    default Collection<RepositoryUserModel> findUserFirstNameAndLastName(String firstName, String lastName) {
        if (firstName == null || firstName.trim().isEmpty() || lastName == null || lastName.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Collection<JPAUserModel> persisted = this.findJPAByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName);
        return USER_MAPPER.toRepositoryModel(persisted);
    }

    @Override
    default void delete(RepositoryUserModel user) {
        if (user != null && user.getIdUser() != null) {
            this.deleteById(user.getIdUser());
        }
    }
}
