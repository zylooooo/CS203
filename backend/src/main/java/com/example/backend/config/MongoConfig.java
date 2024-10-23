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

@Configuration
public class MongoConfig {

    // private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new LocalDateToDateConverter());
        converters.add(new DateToLocalDateConverter());
        converters.add(new StringToLocalDateTimeConverter());
        // converters.add(new LocalDateTimeToStringConverter());
        converters.add(new LocalDateToStringConverter());
        converters.add(new StringToLocalDateConverter());
        return new MongoCustomConversions(converters);
    }

    static class LocalDateToDateConverter implements Converter<LocalDate, Date> {
        @Override
        public Date convert(@NonNull LocalDate source) {
            return Date.from(source.atStartOfDay(ZoneId.systemDefault()).toInstant());
        }
    }

    static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(@NonNull Date source) {
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
    }

    // static class StringToLocalDateTimeConverter implements Converter<String, LocalDateTime> {
    //     @Override
    //     public LocalDateTime convert(@NonNull String source) {
    //         return LocalDateTime.parse(source, DATE_TIME_FORMATTER);
    //     }
    // }

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

    // static class LocalDateTimeToStringConverter implements Converter<LocalDateTime, String> {
    //     @Override
    //     public String convert(@NonNull LocalDateTime source) {
    //         return source.format(DATE_TIME_FORMATTER);
    //     }
    // }

    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(@NonNull LocalDate source) {
            return source.format(DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }

    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(@NonNull String source) {
            return LocalDate.parse(source, DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }
}
