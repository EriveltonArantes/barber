package com.barber.service;

import com.barber.model.RefreshToken;
import com.barber.model.Usuario;
import com.barber.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public RefreshToken createRefreshToken(Usuario usuario) {
        refreshTokenRepository.deleteByUsuario(usuario);
        refreshTokenRepository.flush(); // garante DELETE antes do INSERT

        RefreshToken token = new RefreshToken();
        token.setUsuario(usuario);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plusMillis(refreshExpiration));
        return refreshTokenRepository.save(token);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Refresh token inválido"));
    }

    public boolean isExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    @Transactional
    public void deleteByUsuario(Usuario usuario) {
        refreshTokenRepository.deleteByUsuario(usuario);
    }
}
