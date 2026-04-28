package org.service_user.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.service_user.user.annotation.ApiResponsesAnnotations.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.service_user.user.service.UserService;
import org.service_user.user.service.model.LoginRequestDTO;
import org.service_user.user.service.model.LoginResponseDTO;
import org.service_user.user.service.model.UserCreateDTO;
import org.service_user.user.service.model.UserResponseDTO;
import org.service_user.user.service.model.UserUpdateDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Collection;

@Tag(name = "Users", description = "API de gestión de usuarios - Operaciones CRUD y búsquedas avanzadas")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @Operation(
        summary = "Crear nuevo usuario",
        description = "Crea un nuevo usuario en el sistema con validaciones de email único, contraseña segura y datos obligatorios"
    )
    @CreatedResponse
    @BadRequestResponse
    @ConflictResponse
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateDTO userCreateDTO)  {
        log.info("POST /api/users - creando nuevo usuario");
        UserResponseDTO createdUser = userService.createUser(userCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(
        summary = "Obtener todos los usuarios",
        description = "Retorna la lista completa de usuarios registrados en el sistema"
    )
    @OkResponse
    @GetMapping
    public ResponseEntity<Collection<UserResponseDTO>> getAllUsers() {
        log.info("GET /api/users - Recuperenado todos los usuarios");
        Collection<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Obtener usuario por ID",
        description = "Busca y retorna un usuario específico por su ID único"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        log.info("GET /api/users/{} - Recuperando usuario por ID", id);
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Obtener usuario por email",
        description = "Busca y retorna un usuario por su dirección de email"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> getUserByContactEmail(@PathVariable String email) {
        log.info("GET /api/users/email/{} - Recuperando usuario por email", email);
        return userService.getUserByContactEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Buscar usuarios por nombre",
        description = "Busca usuarios cuyo nombre coincida (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/firstname")
    public ResponseEntity<Collection<UserResponseDTO>> getUsersByFirstName(@RequestParam String name) {
        log.info("GET /api/users/search/firstname?name={} - Buscando por nombre", name);
        Collection<UserResponseDTO> users = userService.getUsersByFirstName(name);
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Buscar usuarios por apellido",
        description = "Busca usuarios cuyo apellido coincida (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/lastname")
    public ResponseEntity<Collection<UserResponseDTO>> getUsersByLastName(@RequestParam String name) {
        log.info("GET /api/users/search/lastname?name={} - Buscando por apellido", name);
        Collection<UserResponseDTO> users = userService.getUsersByLastName(name);
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Buscar usuarios por nombre completo",
        description = "Busca usuarios que coincidan con nombre Y apellido (búsqueda case-insensitive)"
    )
    @OkResponse
    @GetMapping("/search/fullname")
    public ResponseEntity<Collection<UserResponseDTO>> getUsersByFullName(@RequestParam String firstName,
                                                                          @RequestParam String lastName) {
        log.info("GET /api/users/search/fullname?firstName={}&lastName={} - Buscando por nombre completo",
                firstName, lastName);
        Collection<UserResponseDTO> users = userService.getUsersByFullName(firstName, lastName);
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Obtener usuario por teléfono",
        description = "Busca un usuario por su número de teléfono"
    )
    @OkResponseSingle
    @NotFoundResponse
    @GetMapping("/phone/{phoneNumber}")
    public ResponseEntity<UserResponseDTO> getUserByContactPhone(@PathVariable String phoneNumber) {
        log.info("GET /api/users/phone/{} - Recuperando usuario por numero", phoneNumber);
        return userService.getUserByContactPhone(phoneNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Buscar usuarios por rol",
        description = "Retorna todos los usuarios que tengan un rol específico (ADMIN o CUSTOMER)"
    )
    @OkResponse
    @GetMapping("/role/{role}")
    public ResponseEntity<Collection<UserResponseDTO>> getUsersByRole(
            @Parameter(description = "Rol a buscar", required = true, example = "ADMIN",
                    schema = @Schema(allowableValues = {"ADMIN", "CUSTOMER"})) @PathVariable String role) {
        log.info("GET /api/users/role/{} - Buscando usuario por role", role);
        Collection<UserResponseDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @Operation(
        summary = "Actualizar usuario",
        description = "Actualiza parcialmente un usuario existente por email. Solo los campos proporcionados serán actualizados"
    )
    @OkResponseSingle
    @BadRequestResponse
    @NotFoundResponse
    @ConflictResponse
    @PutMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String email,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        log.info("PUT /api/users/email/{} - Actualizando usuario", email);
        UserResponseDTO updatedUser = userService.updateUserByEmail(email, userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(
        summary = "Eliminar usuario",
        description = "Elimina permanentemente un usuario del sistema por email"
    )
    @NoContentResponse
    @NotFoundResponse
    @DeleteMapping("/email/{email}")
    public ResponseEntity<Void> deleteUser(@PathVariable String email) {
        log.info("DELETE /api/users/email/{} - Eliminando usuario", email);
        userService.deleteUserByEmail(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Verificar si existe un email",
        description = "Comprueba si un email ya está registrado en el sistema"
    )
    @StandardOkResponse
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> existsByContactEmail(@PathVariable String email) {
        log.info("GET /api/users/exists/email/{} - Verificando si el correo electrónico de contacto existe", email);
        boolean exists = userService.existsByContactEmail(email);
        return ResponseEntity.ok(exists);
    }

    @Operation(
            summary = "Health check",
            description = "Verifica que el servicio está activo y funcionando"
    )
    @StandardOkResponse
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("User Service está activo");
    }

    @Operation(
            summary = "Login de usuario",
            description = "Verifica las credenciales de un usuario (email y contraseña). Retorna los datos del usuario si el login es exitoso."
    )
    @OkResponseSingle
    @BadRequestResponse
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        log.info("POST /api/users/login - Intento de login para email: {}", loginRequestDTO.getContactEmail());
        LoginResponseDTO response = userService.verifyLogin(loginRequestDTO);
        
        if (response.isSuccess()) {
            log.info("Login exitoso para email: {}", loginRequestDTO.getContactEmail());
            return ResponseEntity.ok(response);
        } else {
            log.warn("Login fallido para email: {}", loginRequestDTO.getContactEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
