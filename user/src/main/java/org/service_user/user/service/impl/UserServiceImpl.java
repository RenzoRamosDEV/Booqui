package org.service_user.user.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_user.user.repository.UserRepository;
import org.service_user.user.repository.model.RepositoryUserModel;
import org.service_user.user.service.UserService;
import org.service_user.user.service.model.LoginRequestDTO;
import org.service_user.user.service.model.LoginResponseDTO;
import org.service_user.user.service.model.ServiceUserMapper;
import org.service_user.user.service.model.UserCreateDTO;
import org.service_user.user.service.model.UserResponseDTO;
import org.service_user.user.service.model.UserUpdateDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ServiceUserMapper serviceUserMapper;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserCreateDTO userCreateDTO) {
        log.debug("Creando usuario: {}", userCreateDTO != null ? userCreateDTO.getContactEmail() : "null");
        
        if (userCreateDTO == null) {
            throw new IllegalArgumentException("Los datos no pueden ser nulos");
        }

        if (userCreateDTO.getRole() == null || userCreateDTO.getRole().trim().isEmpty()) {
            userCreateDTO.setRole("CUSTOMER");
            log.debug("Role no definido, asignando valor por defecto: CUSTOMER");
        }

        if (userRepository.existsByContactEmail(userCreateDTO.getContactEmail())) {
            throw new IllegalStateException("Email existente: " + userCreateDTO.getContactEmail());
        }

        RepositoryUserModel repositoryUserModel = serviceUserMapper.toRepositoryUserModel(userCreateDTO);
        RepositoryUserModel savedUser = userRepository.save(repositoryUserModel);
        
        log.info("Evento creado existosamente con ID: {}", savedUser.getIdUser());
        return serviceUserMapper.toUserResponseDTO(savedUser);
    }

    @Override
    public Collection<UserResponseDTO> getAllUsers() {
        log.debug("Obteniendo todos los eventos");
        Collection<RepositoryUserModel> users = userRepository.findAllUser();
        log.debug("Se encontraron {} eventos", users.size());
        return serviceUserMapper.toUserResponseDTOCollection(users);
    }

    @Override
    public Optional<UserResponseDTO> getUserById(Long id) {
        log.debug("Buscando usuario por ID: {}", id);
        
        if (id == null) {
            log.warn("getUserById llamado con ID nulo");
            return Optional.empty();
        }

        return userRepository.findUserById(id)
                .map(user -> {
                    log.debug("Usuario encontrado con ID: {}", id);
                    return serviceUserMapper.toUserResponseDTO(user);
                });
    }

    @Override
    public Optional<UserResponseDTO> getUserByContactEmail(String email) {
        log.debug("Busacando usuario por email: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("getUserByEmail llamado con email nulo o vacío");
            return Optional.empty();
        }

        return userRepository.findUserByContactEmail(email)
                .map(serviceUserMapper::toUserResponseDTO);
    }

    @Override
    public Collection<UserResponseDTO> getUsersByFirstName(String firstName) {
        log.debug("Busacando usuario por nombre: {}", firstName);
        
        if (firstName == null || firstName.trim().isEmpty()) {
            log.warn("getUsersByFirstName llamado con nombre nulo o invalido");
            return new ArrayList<>();
        }

        Collection<RepositoryUserModel> users = userRepository.findUserByFirstName(firstName);
        log.debug("Se encontraron {} usuarios con nombre: {}", users.size(), firstName);
        return serviceUserMapper.toUserResponseDTOCollection(users);
    }

    @Override
    public Collection<UserResponseDTO> getUsersByLastName(String lastName) {
        log.debug("Busanco usuario por apellido: {}", lastName);
        
        if (lastName == null || lastName.trim().isEmpty()) {
            log.warn("getUsersByLastName llamado con apellido nulo o invalido");
            return new ArrayList<>();
        }

        Collection<RepositoryUserModel> users = userRepository.findUserByLastName(lastName);
        log.debug("Se encontraron {} usuarios con apellido: {}", users.size(), lastName);
        return serviceUserMapper.toUserResponseDTOCollection(users);
    }

    @Override
    public Optional<UserResponseDTO> getUserByContactPhone(String phoneNumber) {
        log.debug("Buscando usuario por numero de celular: {}", phoneNumber);
        
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            log.warn("getUserByPhoneNumber llamado con numero de celular nulo o vacio");
            return Optional.empty();
        }

        return userRepository.findUserByContactPhone(phoneNumber)
                .map(serviceUserMapper::toUserResponseDTO);
    }

    @Override
    public Collection<UserResponseDTO> getUsersByRole(String role) {
        log.debug("Buscando usuario por role: {}", role);
        
        if (role == null || role.trim().isEmpty()) {
            log.warn("getUsersByRole llamado con role nulo o vacio");
            return new ArrayList<>();
        }

        Collection<RepositoryUserModel> users = userRepository.findUserByRole(role);
        log.debug("Se encontraron {} usuarios con role: {}", users.size(), role);
        return serviceUserMapper.toUserResponseDTOCollection(users);
    }

    @Override
    public Collection<UserResponseDTO> getUsersByFullName(String firstName, String lastName) {
        log.debug("Buscando usuario por nombre y apellido: {} {}", firstName, lastName);
        
        if (firstName == null || firstName.trim().isEmpty() || 
            lastName == null || lastName.trim().isEmpty()) {
            log.warn("getUsersByFullName llamado con nombre y apellido nulo o vacio");
            return new ArrayList<>();
        }

        Collection<RepositoryUserModel> users = userRepository.findUserFirstNameAndLastName(firstName, lastName);
        log.debug("Se encontraron {} usuarios con nombre y apellido: {}{}", users.size(), firstName, lastName);
        return serviceUserMapper.toUserResponseDTOCollection(users);
    }


    @Override
    @Transactional
    public UserResponseDTO updateUserByEmail(String email, UserUpdateDTO userUpdateDTO) {
        log.debug("Actualizando usuario con email {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El email del usuario no puede ser nulo o vacío");
        }
        
        if (userUpdateDTO == null) {
            throw new IllegalArgumentException("Los datos de actualización no pueden ser nulos");
        }

        RepositoryUserModel existingUser = userRepository.findUserByContactEmail(email)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado con email: " + email));

        if (userUpdateDTO.getContactEmail() != null &&
            !userUpdateDTO.getContactEmail().equals(existingUser.getContactEmail()) &&
            userRepository.existsByContactEmail(userUpdateDTO.getContactEmail())) {
            throw new IllegalStateException("El correo electrónico ya existe: " + userUpdateDTO.getContactEmail());
        }

        serviceUserMapper.updateRepositoryUserModelFromDTO(userUpdateDTO, existingUser);
        
        RepositoryUserModel updatedUser = userRepository.save(existingUser);
        
        log.info("Usuario actualizado con éxito con el correo electrónico: {}", email);
        return serviceUserMapper.toUserResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUserByEmail(String email) {
        log.debug("Eliminar usuario con correo electrónico: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico no puede ser nulo o vacío");
        }

        RepositoryUserModel user = userRepository.findUserByContactEmail(email)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado con correo electrónico:" + email));

        userRepository.delete(user);
        log.info("Usuario eliminado exitosamente con correo electrónico: {}", email);
    }

    @Override
    public boolean existsByContactEmail(String email) {
        log.debug("Comprobando si existe correo electrónico: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        return userRepository.existsByContactEmail(email);
    }

    @Override
    public LoginResponseDTO verifyLogin(LoginRequestDTO loginRequestDTO) {
        log.debug("Verificando login para email: {}", loginRequestDTO.getContactEmail());

        if (loginRequestDTO == null || loginRequestDTO.getContactEmail() == null || loginRequestDTO.getPassword() == null) {
            log.warn("Intento de login con datos nulos");
            return LoginResponseDTO.builder()
                    .success(false)
                    .message("Email y contraseña son obligatorios")
                    .build();
        }

        Optional<RepositoryUserModel> userOptional = userRepository.findUserByContactEmail(loginRequestDTO.getContactEmail());

        if (userOptional.isEmpty()) {
            log.warn("Intento de login con email no encontrado: {}", loginRequestDTO.getContactEmail());
            return LoginResponseDTO.builder()
                    .success(false)
                    .message("Email o contraseña incorrectos")
                    .build();
        }

        RepositoryUserModel user = userOptional.get();

        if (!user.getPassword().equals(loginRequestDTO.getPassword())) {
            log.warn("Intento de login con contraseña incorrecta para email: {}", loginRequestDTO.getContactEmail());
            return LoginResponseDTO.builder()
                    .success(false)
                    .message("Email o contraseña incorrectos")
                    .build();
        }

        log.info("Login exitoso para usuario: {}", loginRequestDTO.getContactEmail());
        UserResponseDTO userResponse = serviceUserMapper.toUserResponseDTO(user);
        
        return LoginResponseDTO.builder()
                .success(true)
                .message("Login exitoso")
                .user(userResponse)
                .build();
    }
}
