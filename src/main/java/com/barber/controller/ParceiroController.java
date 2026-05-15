package com.barber.controller;

import com.barber.dto.ParceiroDTO;
import com.barber.service.ParceiroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parceiros")
public class ParceiroController {

    private final ParceiroService parceiroService;

    public ParceiroController(ParceiroService parceiroService) {
        this.parceiroService = parceiroService;
    }

    @GetMapping
    public ResponseEntity<List<ParceiroDTO>> findAll() {
        return ResponseEntity.ok(parceiroService.findAll());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ParceiroDTO>> findAtivos() {
        return ResponseEntity.ok(parceiroService.findAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParceiroDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(parceiroService.findById(id));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ParceiroDTO> findByCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(parceiroService.findByCodigo(codigo));
    }

    @PostMapping
    public ResponseEntity<ParceiroDTO> save(@RequestBody ParceiroDTO dto) {
        return ResponseEntity.ok(parceiroService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParceiroDTO> update(@PathVariable Long id, @RequestBody ParceiroDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(parceiroService.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        parceiroService.delete(id);
        return ResponseEntity.ok().build();
    }
}
