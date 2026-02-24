package com.barber.service;

import com.barber.config.JwtUtil;
import com.barber.dto.AuthResponse;
import com.barber.dto.LoginRequest;
import com.barber.dto.RegistroRequest;
import com.barber.model.Usuario;
import com.barber.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, 
                       JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRole(), 
            usuario.getId(), usuario.getNome(), usuario.getTelefone());

        return new AuthResponse(token, usuario.getEmail(), usuario.getNome(), 
            usuario.getRole(), usuario.getId(), usuario.getTelefone());
    }

    public AuthResponse registro(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setNome(request.getNome());
        usuario.setRole(request.getRole() != null ? request.getRole() : "CLIENTE");
        usuario.setTelefone(request.getTelefone());
        usuario.setCpf(request.getCpf());
        usuario.setDataNascimento(request.getDataNascimento());
        usuario.setEndereco(request.getEndereco());
        usuario.setCidade(request.getCidade());
        usuario.setEstado(request.getEstado());
        usuario.setCep(request.getCep());

        usuario = usuarioRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRole(), 
            usuario.getId(), usuario.getNome(), usuario.getTelefone());

        return new AuthResponse(token, usuario.getEmail(), usuario.getNome(), 
            usuario.getRole(), usuario.getId(), usuario.getTelefone());
    }
}