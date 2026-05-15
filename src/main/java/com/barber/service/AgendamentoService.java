package com.barber.service;

import com.barber.dto.AgendamentoDTO;
import com.barber.dto.StatsDTO;
import com.barber.model.Agendamento;
import com.barber.model.Servico;
import com.barber.model.Usuario;
import com.barber.repository.AgendamentoRepository;
import com.barber.repository.ServicoRepository;
import com.barber.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              UsuarioRepository usuarioRepository,
                              ServicoRepository servicoRepository,
                              EmailService emailService,
                              WhatsAppService whatsAppService) {
        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.emailService = emailService;
        this.whatsAppService = whatsAppService;
    }

    public List<AgendamentoDTO> findAll() {
        return agendamentoRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public Page<AgendamentoDTO> findAll(Pageable pageable) {
        return agendamentoRepository.findAll(pageable).map(this::toDTO);
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

        if (dto.getId() == null) {
            emailService.sendAgendamentoConfirmacao(
                cliente.getEmail(), cliente.getNome(), servico.getNome(),
                funcionario.getNome(), agendamento.getData(), agendamento.getHora());
            whatsAppService.sendConfirmacao(
                cliente.getTelefone(), cliente.getNome(), servico.getNome(),
                funcionario.getNome(), agendamento.getData(), agendamento.getHora());
        }

        return toDTO(agendamento);
    }

    public void delete(Long id) {
        Agendamento ag = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        emailService.sendAgendamentoCancelamento(
            ag.getCliente().getEmail(), ag.getCliente().getNome(),
            ag.getServico().getNome(), ag.getData(), ag.getHora());
        whatsAppService.sendCancelamento(
            ag.getCliente().getTelefone(), ag.getCliente().getNome(),
            ag.getServico().getNome(), ag.getData(), ag.getHora());

        agendamentoRepository.deleteById(id);
    }

    public AgendamentoDTO updateStatus(Long id, String status) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        agendamento.setStatus(status);
        agendamento = agendamentoRepository.save(agendamento);
        return toDTO(agendamento);
    }

    public StatsDTO getStats(int diasAtras) {
        LocalDate fim = LocalDate.now();
        LocalDate inicio = fim.minusDays(diasAtras);

        List<Agendamento> agendamentos = agendamentoRepository.findByDataBetween(inicio, fim)
            .stream()
            .filter(a -> !"CANCELADO".equals(a.getStatus()))
            .collect(Collectors.toList());

        long total = agendamentos.size();
        double faturamento = agendamentos.stream().mapToDouble(a -> a.getServico().getPreco()).sum();
        double ticket = total > 0 ? faturamento / total : 0;

        long diasComAgendamento = agendamentos.stream()
            .map(Agendamento::getData).distinct().count();
        double media = diasComAgendamento > 0 ? (double) total / diasComAgendamento : 0;

        StatsDTO stats = new StatsDTO();
        stats.setTotalAgendamentos(total);
        stats.setFaturamentoTotal(faturamento);
        stats.setTicketMedio(ticket);
        stats.setMediaDiaria(media);

        List<Object[]> porServico = agendamentoRepository.countByServico(inicio, fim);
        stats.setPorServico(porServico.stream().map(r -> {
            StatsDTO.ItemStats item = new StatsDTO.ItemStats();
            item.setNome((String) r[0]);
            item.setQuantidade(((Number) r[1]).longValue());
            item.setFaturamento(((Number) r[2]).doubleValue());
            return item;
        }).collect(Collectors.toList()));

        List<Object[]> porFunc = agendamentoRepository.countByFuncionario(inicio, fim);
        stats.setPorFuncionario(porFunc.stream().map(r -> {
            StatsDTO.ItemStats item = new StatsDTO.ItemStats();
            item.setNome((String) r[0]);
            item.setQuantidade(((Number) r[1]).longValue());
            item.setFaturamento(((Number) r[2]).doubleValue());
            return item;
        }).collect(Collectors.toList()));

        List<Object[]> porCliente = agendamentoRepository.countByCliente(inicio, fim);
        if (!porCliente.isEmpty()) stats.setClienteTop((String) porCliente.get(0)[0]);

        if (!stats.getPorServico().isEmpty()) stats.setServicoTop(stats.getPorServico().get(0).getNome());
        if (!stats.getPorFuncionario().isEmpty()) stats.setFuncionarioTop(stats.getPorFuncionario().get(0).getNome());

        List<Object[]> porDia = agendamentoRepository.faturamentoPorDia(inicio, fim);
        stats.setFaturamentoPorDia(porDia.stream().map(r -> {
            StatsDTO.DiaStats dia = new StatsDTO.DiaStats();
            dia.setData(r[0].toString());
            dia.setQuantidade(((Number) r[1]).longValue());
            dia.setFaturamento(((Number) r[2]).doubleValue());
            return dia;
        }).collect(Collectors.toList()));

        return stats;
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
