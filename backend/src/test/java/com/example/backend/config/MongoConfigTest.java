package com.example.backend.config;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class MongoConfigTest {

    @Test
    void convertLocalDate_toDate_whenLocalDateProvided_shouldConvertCorrectly() {
        // Arrange
        LocalDate localDate = LocalDate.of(2023, 5, 15);
        MongoConfig.LocalDateToDateConverter converter = new MongoConfig.LocalDateToDateConverter();

        // Act
        Date result = converter.convert(localDate);

        // Assert
        assertNotNull(result);
        assertEquals(localDate, result.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
    }

    @Test
    void convertDate_toLocalDate_whenDateProvided_shouldConvertCorrectly() {
        // Arrange
        Date date = new Date();
        MongoConfig.DateToLocalDateConverter converter = new MongoConfig.DateToLocalDateConverter();

        // Act
        LocalDate result = converter.convert(date);

        // Assert
        assertNotNull(result);
        assertEquals(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate(), result);
    }

    @Test
    void convertLocalDate_toString_whenLocalDateProvided_shouldConvertCorrectly() {
        // Arrange
        LocalDate localDate = LocalDate.of(2023, 5, 15);
        MongoConfig.LocalDateToStringConverter converter = new MongoConfig.LocalDateToStringConverter();

        // Act
        String result = converter.convert(localDate);

        // Assert
        assertNotNull(result);
        assertEquals("2023-05-15", result);
    }

    @Test
    void convertString_toLocalDate_whenStringProvided_shouldConvertCorrectly() {
        // Arrange
        String dateString = "2023-05-15";
        MongoConfig.StringToLocalDateConverter converter = new MongoConfig.StringToLocalDateConverter();

        // Act
        LocalDate result = converter.convert(dateString);

        // Assert
        assertNotNull(result);
        assertEquals(LocalDate.of(2023, 5, 15), result);
    }
}
