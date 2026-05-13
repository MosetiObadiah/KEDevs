package org.moseti.kedevsapi.shared.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

import java.sql.SQLException;
import java.util.Collections;
import java.util.Map;

/**
 * JPA AttributeConverter for PostgreSQL jsonb columns.
 * Wraps the serialized JSON in a PGobject so the JDBC driver
 * sends it with the correct OID (jsonb), preventing the
 * "column is of type jsonb but expression is of type character varying" error.
 */
@Converter
public class JsonbConverter implements AttributeConverter<Map<String, Object>, Object> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Object convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null) return null;
        try {
            String json = mapper.writeValueAsString(attribute);
            PGobject pgo = new PGobject();
            pgo.setType("jsonb");
            pgo.setValue(json);
            return pgo;
        } catch (JsonProcessingException | SQLException e) {
            PGobject pgo = new PGobject();
            try {
                pgo.setType("jsonb");
                pgo.setValue("{}");
            } catch (SQLException ignored) {}
            return pgo;
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(Object dbData) {
        if (dbData == null) return Collections.emptyMap();
        try {
            String json = dbData instanceof PGobject ? ((PGobject) dbData).getValue() : dbData.toString();
            if (json == null || json.isBlank()) return Collections.emptyMap();
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyMap();
        }
    }
}
