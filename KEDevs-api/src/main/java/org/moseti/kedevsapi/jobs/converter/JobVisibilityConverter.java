package org.moseti.kedevsapi.jobs.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.moseti.kedevsapi.shared.enums.JobVisibility;

@Converter(autoApply = true)
public class JobVisibilityConverter implements AttributeConverter<JobVisibility, String> {

    @Override
    public String convertToDatabaseColumn(JobVisibility attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public JobVisibility convertToEntityAttribute(String dbData) {
        return JobVisibility.fromValue(dbData);
    }
}
