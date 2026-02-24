package com.barber.controller;

import com.barber.dto.AgendamentoDTO;
import com.barber.service.AgendamentoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoDTO>> findAll() {
        return ResponseEntity.ok(agendamentoService.findAll());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AgendamentoDTO>> findByClienteId(@PathVariable Long clienteId) {
        return ResponseEntity.ok(agendamentoService.findByClienteId(clienteId));
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public ResponseEntity<List<AgendamentoDTO>> findByFuncionarioId(@PathVariable Long funcionarioId) {
        return ResponseEntity.ok(agendamentoService.findByFuncionarioId(funcionarioId));
    }

    @GetMapping("/funcionario/{funcionarioId}/data")
    public ResponseEntity<List<AgendamentoDTO>> findByFuncionarioIdAndData(
            @PathVariable Long funcionarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(agendamentoService.findByFuncionarioIdAndData(funcionarioId, data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AgendamentoDTO> save(@RequestBody AgendamentoDTO dto) {
        return ResponseEntity.ok(agendamentoService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        agendamentoService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AgendamentoDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(agendamentoService.updateStatus(id, status));
    }
}