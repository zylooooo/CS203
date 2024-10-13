package com.example.backend.security;

import com.example.backend.model.User;



import com.example.backend.model.Admin;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Collection;
import java.util.List;

/**
 * UserPrincipal class that implements UserDetails interface.
 * This class is used to store the user and admininformation and authorities.
 * This is crucial for JWT authentication.
 */

public class UserPrincipal implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String username;
    private String password;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String username, String password, boolean enabled, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole())); // use singletonList to avoid duplicate entries

        return new UserPrincipal(
            user.getId(),
            user.getUsername(),
            user.getPassword(),
            user.isEnabled(),
            authorities
        );
    }

    public static UserPrincipal create(Admin admin) {
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(admin.getRole())); // use singletonList to avoid duplicate entries

        return new UserPrincipal(
            admin.getId(),
            admin.getAdminName(),
            admin.getPassword(),
            true,
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public String getId() {
        return id;
    }
}
