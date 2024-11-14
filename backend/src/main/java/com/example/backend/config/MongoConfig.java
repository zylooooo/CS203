package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Arrays;

/**
 * Configuration class for MongoDB custom type conversions.
 * Provides custom converters for date and time types between Java and MongoDB.
 */
@Configuration
public class MongoConfig {

    /**
     * Creates custom conversions for MongoDB to handle Java date/time types.
     *
     * @return MongoCustomConversions configured with custom type converters
     */
    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new LocalDateToDateConverter());
        converters.add(new DateToLocalDateConverter());
        converters.add(new StringToLocalDateTimeConverter());
        converters.add(new LocalDateToStringConverter());
        converters.add(new StringToLocalDateConverter());
        return new MongoCustomConversions(converters);
    }

    /**
     * Converter class to transform LocalDate to Date objects.
     */
    static class LocalDateToDateConverter implements Converter<LocalDate, Date> {
        @Override
        public Date convert(@NonNull LocalDate source) {
            return Date.from(source.atStartOfDay(ZoneId.systemDefault()).toInstant());
        }
    }

    /**
     * Converter class to transform Date to LocalDate objects.
     */
    static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(@NonNull Date source) {
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
    }

    /**
     * Converter class to transform String to LocalDateTime objects.
     * Supports multiple date-time formats for flexible parsing.
     */
    public class StringToLocalDateTimeConverter implements Converter<String, LocalDateTime> {
        private static final List<DateTimeFormatter> formatters = Arrays.asList(
            DateTimeFormatter.ofPattern("yyyy-M-d HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME
        );

        @Override
        public LocalDateTime convert(@NonNull String source) {
            if (source == null || source.isEmpty()) {
                return null;
            }
            for (DateTimeFormatter formatter : formatters) {
                try {
                    return LocalDateTime.parse(source, formatter);
                } catch (DateTimeParseException e) {
                    // Try next formatter
                }
            }
            throw new IllegalArgumentException("Unable to parse datetime: " + source);
        }
    }

    /**
     * Converter class to transform LocalDate to String objects.
     * Uses ISO local date format for conversion.
     */
    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(@NonNull LocalDate source) {
            return source.format(DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }

    /**
     * Converter class to transform String to LocalDate objects.
     * Uses ISO local date format for parsing.
     */
    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(@NonNull String source) {
            return LocalDate.parse(source, DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }
}
