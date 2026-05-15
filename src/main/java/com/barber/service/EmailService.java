package com.barber.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendAgendamentoConfirmacao(String toEmail, String clienteNome,
            String servicoNome, String funcionarioNome,
            LocalDate data, LocalTime hora) {
        if (mailSender == null || toEmail == null || toEmail.isBlank()) return;

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Agendamento confirmado - Barbearia");
            helper.setText(buildConfirmacaoHtml(clienteNome, servicoNome, funcionarioNome, data, hora), true);
            mailSender.send(msg);
        } catch (Exception e) {
            // não quebra o fluxo principal
        }
    }

    public void sendAgendamentoCancelamento(String toEmail, String clienteNome,
            String servicoNome, LocalDate data, LocalTime hora) {
        if (mailSender == null || toEmail == null || toEmail.isBlank()) return;

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Agendamento cancelado - Barbearia");
            helper.setText(buildCancelamentoHtml(clienteNome, servicoNome, data, hora), true);
            mailSender.send(msg);
        } catch (Exception e) {
            // não quebra o fluxo principal
        }
    }

    private String buildConfirmacaoHtml(String nome, String servico, String funcionario,
            LocalDate data, LocalTime hora) {
        String dataFmt = data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String horaFmt = hora.format(DateTimeFormatter.ofPattern("HH:mm"));
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#f5f5f5;padding:2rem;border-radius:8px">
              <h1 style="color:#c9a227;border-bottom:2px solid #c9a227;padding-bottom:1rem">✅ Agendamento Confirmado</h1>
              <p>Olá, <strong>%s</strong>!</p>
              <p>Seu agendamento foi confirmado com sucesso:</p>
              <div style="background:#2d2d2d;padding:1rem;border-radius:8px;border-left:4px solid #c9a227;margin:1rem 0">
                <p><strong>Serviço:</strong> %s</p>
                <p><strong>Profissional:</strong> %s</p>
                <p><strong>Data:</strong> %s</p>
                <p><strong>Horário:</strong> %s</p>
              </div>
              <p style="color:#a0a0a0;font-size:0.9rem">Em caso de dúvidas, entre em contato com a barbearia.</p>
            </div>
            """.formatted(nome, servico, funcionario, dataFmt, horaFmt);
    }

    private String buildCancelamentoHtml(String nome, String servico, LocalDate data, LocalTime hora) {
        String dataFmt = data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String horaFmt = hora.format(DateTimeFormatter.ofPattern("HH:mm"));
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#f5f5f5;padding:2rem;border-radius:8px">
              <h1 style="color:#dc3545;border-bottom:2px solid #dc3545;padding-bottom:1rem">❌ Agendamento Cancelado</h1>
              <p>Olá, <strong>%s</strong>!</p>
              <p>Seu agendamento foi cancelado:</p>
              <div style="background:#2d2d2d;padding:1rem;border-radius:8px;border-left:4px solid #dc3545;margin:1rem 0">
                <p><strong>Serviço:</strong> %s</p>
                <p><strong>Data:</strong> %s às %s</p>
              </div>
              <p style="color:#a0a0a0;font-size:0.9rem">Para reagendar, acesse o site ou entre em contato.</p>
            </div>
            """.formatted(nome, servico, dataFmt, horaFmt);
    }
}
