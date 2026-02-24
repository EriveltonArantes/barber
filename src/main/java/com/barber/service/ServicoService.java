package com.barber.service;

import com.barber.dto.ServicoDTO;
import com.barber.model.Servico;
import com.barber.repository.ServicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    public List<ServicoDTO> findAll() {
        return servicoRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<ServicoDTO> findAtivos() {
        return servicoRepository.findByAtivoTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ServicoDTO findById(Long id) {
        Servico servico = servicoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        return toDTO(servico);
    }

    public ServicoDTO save(ServicoDTO dto) {
        Servico servico = new Servico();
        if (dto.getId() != null) {
            servico = servicoRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        }
        servico.setNome(dto.getNome());
        servico.setDuracao(dto.getDuracao());
        servico.setPreco(dto.getPreco());
        servico.setAtivo(dto.isAtivo());

        servico = servicoRepository.save(servico);
        return toDTO(servico);
    }

    public void delete(Long id) {
        servicoRepository.deleteById(id);
    }

    private ServicoDTO toDTO(Servico servico) {
        ServicoDTO dto = new ServicoDTO();
        dto.setId(servico.getId());
        dto.setNome(servico.getNome());
        dto.setDuracao(servico.getDuracao());
        dto.setPreco(servico.getPreco());
        dto.setAtivo(servico.isAtivo());
        return dto;
    }
}