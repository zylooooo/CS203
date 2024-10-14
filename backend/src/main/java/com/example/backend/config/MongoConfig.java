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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class MongoConfig {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new LocalDateToDateConverter());
        converters.add(new DateToLocalDateConverter());
        converters.add(new StringToLocalDateTimeConverter());
        converters.add(new LocalDateTimeToStringConverter());
        converters.add(new LocalDateToStringConverter());
        converters.add(new StringToLocalDateConverter());
        return new MongoCustomConversions(converters);
    }

    private static class LocalDateToDateConverter implements Converter<LocalDate, Date> {
        @Override
        public Date convert(@NonNull LocalDate source) {
            return Date.from(source.atStartOfDay(ZoneId.systemDefault()).toInstant());
        }
    }

    private static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(@NonNull Date source) {
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
    }

    private static class StringToLocalDateTimeConverter implements Converter<String, LocalDateTime> {
        @Override
        public LocalDateTime convert(@NonNull String source) {
            return LocalDateTime.parse(source, DATE_TIME_FORMATTER);
        }
    }

    private static class LocalDateTimeToStringConverter implements Converter<LocalDateTime, String> {
        @Override
        public String convert(@NonNull LocalDateTime source) {
            return source.format(DATE_TIME_FORMATTER);
        }
    }

    private static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(@NonNull LocalDate source) {
            return source.format(DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }

    private static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(@NonNull String source) {
            return LocalDate.parse(source, DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }
}
