package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class OtpService {

    private Map<String, OtpData> otpMap = new HashMap<>();

    @Async("otpExecutor")
    public CompletableFuture<String> generateOTP(String username) {
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(5);
        otpMap.put(username, new OtpData(otp, expirationTime));
        return CompletableFuture.completedFuture(otp);
    }

    @Async("otpExecutor")
    public CompletableFuture<Boolean> validateOTP(String username, String otp) {
        OtpData otpData = otpMap.get(username);
        if (otpData != null && otpData.getOtp().equals(otp) && LocalDateTime.now().isBefore(otpData.getExpirationTime())) {
            otpMap.remove(username);
            return CompletableFuture.completedFuture(true);
        }
        return CompletableFuture.completedFuture(false);
    }

    private static class OtpData {
        private final String otp;
        private final LocalDateTime expirationTime;

        public OtpData(String otp, LocalDateTime expirationTime) {
            this.otp = otp;
            this.expirationTime = expirationTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpirationTime() {
            return expirationTime;
        }
    }
}