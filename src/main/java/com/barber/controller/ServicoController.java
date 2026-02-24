package com.barber.controller;

import com.barber.dto.ServicoDTO;
import com.barber.service.ServicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public ResponseEntity<List<ServicoDTO>> findAll() {
        return ResponseEntity.ok(servicoService.findAll());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ServicoDTO>> findAtivos() {
        return ResponseEntity.ok(servicoService.findAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ServicoDTO> save(@RequestBody ServicoDTO dto) {
        return ResponseEntity.ok(servicoService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        servicoService.delete(id);
        return ResponseEntity.ok().build();
    }
}