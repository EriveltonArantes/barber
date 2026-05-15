package com.barber.service;

import com.barber.config.JwtUtil;
import com.barber.dto.AuthResponse;
import com.barber.dto.LoginRequest;
import com.barber.dto.RegistroRequest;
import com.barber.model.Usuario;
import com.barber.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.barber.model.RefreshToken;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private com.barber.service.RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private RegistroRequest registroRequest;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@email.com");
        loginRequest.setSenha("password123");

        registroRequest = new RegistroRequest();
        registroRequest.setEmail("new@email.com");
        registroRequest.setSenha("password123");
        registroRequest.setNome("New User");
        registroRequest.setRole("CLIENTE");
        registroRequest.setTelefone("(11) 99999-9999");

        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@email.com");
        usuario.setSenha("encodedPassword");
        usuario.setNome("Test User");
        usuario.setRole("CLIENTE");
        usuario.setTelefone("(11) 99999-9999");
    }

    private RefreshToken refreshTokenMock() {
        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh123");
        rt.setExpiryDate(Instant.now().plusSeconds(3600));
        rt.setUsuario(usuario);
        return rt;
    }

    @Test
    void login_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("test@email.com", "password123"));
        when(usuarioRepository.findByEmail("test@email.com")).thenReturn(Optional.of(usuario));
        when(jwtUtil.generateToken(anyString(), anyString(), any(), anyString(), anyString()))
                .thenReturn("token123");
        when(refreshTokenService.createRefreshToken(any())).thenReturn(refreshTokenMock());

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("token123", response.getToken());
        assertEquals("test@email.com", response.getEmail());
        assertEquals("CLIENTE", response.getRole());
    }

    @Test
    void login_Failure_UserNotFound() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("test@email.com", "password123"));
        when(usuarioRepository.findByEmail("test@email.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    void registro_Success() {
        when(usuarioRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(jwtUtil.generateToken(anyString(), anyString(), any(), anyString(), anyString()))
                .thenReturn("token123");
        when(refreshTokenService.createRefreshToken(any())).thenReturn(refreshTokenMock());

        AuthResponse response = authService.registro(registroRequest);

        assertNotNull(response);
        assertEquals("token123", response.getToken());
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void registro_Failure_EmailAlreadyExists() {
        when(usuarioRepository.existsByEmail("new@email.com")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.registro(registroRequest));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}