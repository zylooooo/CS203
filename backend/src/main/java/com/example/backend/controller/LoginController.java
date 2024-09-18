package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.logging.Logger;

@Controller
public class LoginController {
    private static final Logger logger = Logger.getLogger(LoginController.class.getName());

    @GetMapping("/login")
    public String showLoginPage(Authentication authentication, 
                                HttpServletRequest request,
                                HttpSession session) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/";
        }
        
        String referer = request.getHeader("Referer");
        logger.info("Referer: " + referer);
        
        if (referer != null && !referer.contains("/login")) {
            session.setAttribute("REDIRECT_URL", referer);
            logger.info("Set REDIRECT_URL in session: " + referer);
        }
        
        return "login";
    }
}