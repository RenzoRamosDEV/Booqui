package org.service_user.user.service.model;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.service_user.user.repository.model.RepositoryUserModel;

import java.util.Collection;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ServiceUserMapper {

    @Mapping(target = "idUser", ignore = true)
    RepositoryUserModel toRepositoryUserModel(UserCreateDTO userCreateDTO);

    UserResponseDTO toUserResponseDTO(RepositoryUserModel repositoryUserModel);

    Collection<UserResponseDTO> toUserResponseDTOCollection(Collection<RepositoryUserModel> repositoryUserModels);

    @Mapping(target = "idUser", ignore = true)
    void updateRepositoryUserModelFromDTO(UserUpdateDTO userUpdateDTO, @MappingTarget RepositoryUserModel repositoryUserModel);
}
