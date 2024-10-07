// package com.example.backend.config;

// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

// import java.io.IOException;

// public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
//     @Override
//     public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
//         String redirectURL = "/user/home";
    
//         if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
//             redirectURL = "/admin/home";
//         }
        
//         response.sendRedirect(redirectURL);
//     }
// }

package com.example.backend.config;

import com.example.backend.service.OtpService;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String username = authentication.getName();
        String email = userService.getUserByUsername(username).getEmail();
        String otp = otpService.generateOTP(username);
        boolean emailSent = emailService.sendOtpEmail(email, otp);

        HttpSession session = request.getSession();
        session.setAttribute("needOtpVerification", true);

        if (emailSent) {
            response.sendRedirect("/otp/verify");
        } else {
            response.sendRedirect("/login?error=email");
        }
    }
}
