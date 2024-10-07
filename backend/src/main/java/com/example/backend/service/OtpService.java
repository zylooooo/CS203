package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OtpService {

    private Map<String, OtpData> otpMap = new HashMap<>();

    public String generateOTP(String username) {
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(5);
        otpMap.put(username, new OtpData(otp, expirationTime));
        return otp;
    }

    public boolean validateOTP(String username, String otp) {
        OtpData otpData = otpMap.get(username);
        if (otpData != null && otpData.getOtp().equals(otp) && LocalDateTime.now().isBefore(otpData.getExpirationTime())) {
            otpMap.remove(username);
            return true;
        }
        return false;
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