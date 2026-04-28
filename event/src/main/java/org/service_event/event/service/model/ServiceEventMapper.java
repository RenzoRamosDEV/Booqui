package org.service_event.event.service.model;

import org.mapstruct.*;
import org.service_event.event.repository.model.RepositoryEventModel;
import java.util.Collection;


@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ServiceEventMapper {

    @Mapping(target = "idEvent", ignore = true)
    RepositoryEventModel toRepositoryEventModel(EventCreateDTO eventCreateDTO);

    EventResponseDTO toEventResponseDTO(RepositoryEventModel repositoryEventModel);

    Collection<EventResponseDTO> toEventResponseDTOCollection(Collection<RepositoryEventModel> repositoryEventModels);

    @Mapping(target = "idEvent", ignore = true)
    void updateRepositoryEventModelFromDTO(EventUpdateDTO eventUpdateDTO,
                                           @MappingTarget RepositoryEventModel repositoryEventModel
    );
}
