package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new LocalDateToDateConverter());
        converters.add(new DateToLocalDateConverter());
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
}
