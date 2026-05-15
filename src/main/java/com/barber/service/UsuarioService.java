package com.barber.service;

import com.barber.dto.UsuarioDTO;
import com.barber.model.Usuario;
import com.barber.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioDTO> findAll() {
        return usuarioRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<UsuarioDTO> findByRole(String role) {
        return usuarioRepository.findByRole(role).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public UsuarioDTO findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return toDTO(usuario);
    }

    public UsuarioDTO save(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        if (dto.getId() != null) {
            usuario = usuarioRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        }
        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        usuario.setNome(dto.getNome());
        usuario.setRole(dto.getRole());
        usuario.setTelefone(dto.getTelefone());
        usuario.setCpf(dto.getCpf());
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setEndereco(dto.getEndereco());
        usuario.setCidade(dto.getCidade());
        usuario.setEstado(dto.getEstado());
        usuario.setCep(dto.getCep());
        usuario.setComissaoPercentual(dto.getComissaoPercentual());

        usuario = usuarioRepository.save(usuario);
        return toDTO(usuario);
    }

    public void delete(Long id) {
        usuarioRepository.deleteById(id);
    }

    public List<UsuarioDTO> buscarClientes(String q) {
        return usuarioRepository.buscarClientes(q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public UsuarioDTO clienteRapido(String nome, String telefone, String email) {
        String emailFinal = (email != null && !email.isBlank()) ? email
            : "cliente_" + UUID.randomUUID().toString().substring(0, 8) + "@balcao.local";
        if (usuarioRepository.existsByEmail(emailFinal)) {
            return toDTO(usuarioRepository.findByEmail(emailFinal).get());
        }
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setTelefone(telefone);
        u.setEmail(emailFinal);
        u.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        u.setRole("CLIENTE");
        return toDTO(usuarioRepository.save(u));
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setEmail(usuario.getEmail());
        dto.setNome(usuario.getNome());
        dto.setRole(usuario.getRole());
        dto.setTelefone(usuario.getTelefone());
        dto.setCpf(usuario.getCpf());
        dto.setDataNascimento(usuario.getDataNascimento());
        dto.setEndereco(usuario.getEndereco());
        dto.setCidade(usuario.getCidade());
        dto.setEstado(usuario.getEstado());
        dto.setCep(usuario.getCep());
        dto.setComissaoPercentual(usuario.getComissaoPercentual());
        return dto;
    }
}