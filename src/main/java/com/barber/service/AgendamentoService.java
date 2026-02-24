package com.barber.service;

import com.barber.dto.AgendamentoDTO;
import com.barber.model.Agendamento;
import com.barber.model.Servico;
import com.barber.model.Usuario;
import com.barber.repository.AgendamentoRepository;
import com.barber.repository.ServicoRepository;
import com.barber.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicoRepository servicoRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository, 
                              UsuarioRepository usuarioRepository,
                              ServicoRepository servicoRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
    }

    public List<AgendamentoDTO> findAll() {
        return agendamentoRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<AgendamentoDTO> findByClienteId(Long clienteId) {
        return agendamentoRepository.findByClienteId(clienteId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<AgendamentoDTO> findByFuncionarioId(Long funcionarioId) {
        return agendamentoRepository.findByFuncionarioId(funcionarioId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<AgendamentoDTO> findByFuncionarioIdAndData(Long funcionarioId, LocalDate data) {
        return agendamentoRepository.findByFuncionarioIdAndData(funcionarioId, data).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public AgendamentoDTO findById(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        return toDTO(agendamento);
    }

    public AgendamentoDTO save(AgendamentoDTO dto) {
        // Verificar se o horário está disponível
        if (dto.getId() == null) {
            boolean horarioOcupado = agendamentoRepository.existsByFuncionarioIdAndDataAndHora(
                dto.getFuncionarioId(), dto.getData(), dto.getHora());
            if (horarioOcupado) {
                throw new RuntimeException("Horário não disponível para este funcionário");
            }
        }

        Agendamento agendamento = new Agendamento();
        if (dto.getId() != null) {
            agendamento = agendamentoRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        }

        Usuario cliente = usuarioRepository.findById(dto.getClienteId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Usuario funcionario = usuarioRepository.findById(dto.getFuncionarioId())
            .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
        Servico servico = servicoRepository.findById(dto.getServicoId())
            .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

        agendamento.setCliente(cliente);
        agendamento.setFuncionario(funcionario);
        agendamento.setServico(servico);
        agendamento.setData(dto.getData());
        agendamento.setHora(dto.getHora());
        agendamento.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDENTE");
        agendamento.setObservacoes(dto.getObservacoes());

        agendamento = agendamentoRepository.save(agendamento);
        return toDTO(agendamento);
    }

    public void delete(Long id) {
        agendamentoRepository.deleteById(id);
    }

    public AgendamentoDTO updateStatus(Long id, String status) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        agendamento.setStatus(status);
        agendamento = agendamentoRepository.save(agendamento);
        return toDTO(agendamento);
    }

    private AgendamentoDTO toDTO(Agendamento agendamento) {
        AgendamentoDTO dto = new AgendamentoDTO();
        dto.setId(agendamento.getId());
        dto.setClienteId(agendamento.getCliente().getId());
        dto.setClienteNome(agendamento.getCliente().getNome());
        dto.setClienteTelefone(agendamento.getCliente().getTelefone());
        dto.setFuncionarioId(agendamento.getFuncionario().getId());
        dto.setFuncionarioNome(agendamento.getFuncionario().getNome());
        dto.setServicoId(agendamento.getServico().getId());
        dto.setServicoNome(agendamento.getServico().getNome());
        dto.setServicoPreco(agendamento.getServico().getPreco());
        dto.setServicoDuracao(agendamento.getServico().getDuracao());
        dto.setData(agendamento.getData());
        dto.setHora(agendamento.getHora());
        dto.setStatus(agendamento.getStatus());
        dto.setObservacoes(agendamento.getObservacoes());
        return dto;
    }
}