package com.barber.service;

import com.barber.dto.ServicoDTO;
import com.barber.model.Servico;
import com.barber.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ServicoService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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
        servico.setDescricao(dto.getDescricao());
        if (dto.getPhotoUrl() != null) {
            servico.setPhotoUrl(dto.getPhotoUrl());
        }

        servico = servicoRepository.save(servico);
        return toDTO(servico);
    }

    public ServicoDTO uploadFoto(Long id, MultipartFile file) throws IOException {
        Servico servico = servicoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String ext = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = "servico_" + id + "_" + UUID.randomUUID() + ext;
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // remove foto antiga se existir
        if (servico.getPhotoUrl() != null) {
            try {
                String oldFile = servico.getPhotoUrl().substring(servico.getPhotoUrl().lastIndexOf("/") + 1);
                Files.deleteIfExists(uploadPath.resolve(oldFile));
            } catch (Exception ignored) {}
        }

        servico.setPhotoUrl("/uploads/" + filename);
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
        dto.setDescricao(servico.getDescricao());
        dto.setPhotoUrl(servico.getPhotoUrl());
        return dto;
    }
}
