package org.service_user.user.service;

import org.service_user.user.service.model.LoginRequestDTO;
import org.service_user.user.service.model.LoginResponseDTO;
import org.service_user.user.service.model.UserCreateDTO;
import org.service_user.user.service.model.UserResponseDTO;
import org.service_user.user.service.model.UserUpdateDTO;

import java.util.Collection;
import java.util.Optional;


public interface UserService {

    UserResponseDTO createUser(UserCreateDTO userCreateDTO);

    Collection<UserResponseDTO> getAllUsers();

    Optional<UserResponseDTO> getUserById(Long id);

    Optional<UserResponseDTO> getUserByContactEmail(String email);

    Collection<UserResponseDTO> getUsersByFirstName(String firstName);

    Collection<UserResponseDTO> getUsersByLastName(String lastName);

    Optional<UserResponseDTO> getUserByContactPhone(String phoneNumber);

    Collection<UserResponseDTO> getUsersByRole(String role);

    Collection<UserResponseDTO> getUsersByFullName(String firstName, String lastName);

    UserResponseDTO updateUserByEmail(String email, UserUpdateDTO userUpdateDTO);

    void deleteUserByEmail(String email);

    boolean existsByContactEmail(String email);

    LoginResponseDTO verifyLogin(LoginRequestDTO loginRequestDTO);
}
