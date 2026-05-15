package com.barber.controller;

import com.barber.dto.UsuarioDTO;
import com.barber.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> findAll() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UsuarioDTO>> findByRole(@PathVariable String role) {
        return ResponseEntity.ok(usuarioService.findByRole(role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> save(@RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(usuarioService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuarioService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/clientes/buscar")
    public ResponseEntity<List<UsuarioDTO>> buscarClientes(@RequestParam String q) {
        return ResponseEntity.ok(usuarioService.buscarClientes(q));
    }

    @PostMapping("/cliente-rapido")
    public ResponseEntity<UsuarioDTO> clienteRapido(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(usuarioService.clienteRapido(
            body.get("nome"), body.get("telefone"), body.get("email")));
    }
}