package com.barber.service;

import com.barber.dto.ParceiroDTO;
import com.barber.model.Parceiro;
import com.barber.repository.ParceiroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParceiroService {

    private final ParceiroRepository parceiroRepository;

    public ParceiroService(ParceiroRepository parceiroRepository) {
        this.parceiroRepository = parceiroRepository;
    }

    public List<ParceiroDTO> findAll() {
        return parceiroRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ParceiroDTO> findAtivos() {
        return parceiroRepository.findByAtivoTrue().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ParceiroDTO findById(Long id) {
        return toDTO(parceiroRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Parceiro não encontrado")));
    }

    public ParceiroDTO findByCodigo(String codigo) {
        return toDTO(parceiroRepository.findByCodigo(codigo)
            .orElseThrow(() -> new RuntimeException("Código de indicação inválido")));
    }

    public ParceiroDTO save(ParceiroDTO dto) {
        Parceiro parceiro = new Parceiro();
        if (dto.getId() != null) {
            parceiro = parceiroRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Parceiro não encontrado"));
        }
        parceiro.setNome(dto.getNome());
        parceiro.setCodigo(dto.getCodigo().toUpperCase().trim());
        parceiro.setPercentualComissao(dto.getPercentualComissao());
        parceiro.setAtivo(dto.isAtivo());
        parceiro.setContato(dto.getContato());
        return toDTO(parceiroRepository.save(parceiro));
    }

    public void delete(Long id) {
        parceiroRepository.deleteById(id);
    }

    private ParceiroDTO toDTO(Parceiro p) {
        ParceiroDTO dto = new ParceiroDTO();
        dto.setId(p.getId());
        dto.setNome(p.getNome());
        dto.setCodigo(p.getCodigo());
        dto.setPercentualComissao(p.getPercentualComissao());
        dto.setAtivo(p.isAtivo());
        dto.setContato(p.getContato());
        return dto;
    }
}
