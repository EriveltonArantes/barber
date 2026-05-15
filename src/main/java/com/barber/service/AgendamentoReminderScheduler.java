package com.barber.service;

import com.barber.model.Agendamento;
import com.barber.repository.AgendamentoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class AgendamentoReminderScheduler {

    private final AgendamentoRepository agendamentoRepository;
    private final WhatsAppService whatsAppService;

    public AgendamentoReminderScheduler(AgendamentoRepository agendamentoRepository,
                                        WhatsAppService whatsAppService) {
        this.agendamentoRepository = agendamentoRepository;
        this.whatsAppService = whatsAppService;
    }

    // Roda a cada 5 minutos; janela de 55–65 min a partir de agora
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    @Transactional
    public void enviarLembretes() {
        LocalDateTime alvo = LocalDateTime.now().plusMinutes(60);
        LocalDate dataAlvo = alvo.toLocalDate();
        LocalTime horaMin = alvo.minusMinutes(5).toLocalTime();
        LocalTime horaMax = alvo.plusMinutes(5).toLocalTime();

        List<Agendamento> candidatos = agendamentoRepository
            .findReminderCandidates(dataAlvo, horaMin, horaMax);

        for (Agendamento ag : candidatos) {
            whatsAppService.sendLembrete(
                ag.getCliente().getTelefone(),
                ag.getCliente().getNome(),
                ag.getServico().getNome(),
                ag.getFuncionario().getNome(),
                ag.getHora()
            );
            ag.setReminderSent(true);
            agendamentoRepository.save(ag);
        }
    }
}
