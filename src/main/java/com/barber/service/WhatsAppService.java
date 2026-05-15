package com.barber.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class WhatsAppService {

    @Value("${whatsapp.twilio.account-sid:}")
    private String accountSid;

    @Value("${whatsapp.twilio.auth-token:}")
    private String authToken;

    @Value("${whatsapp.twilio.from:whatsapp:+14155238886}")
    private String fromNumber;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendConfirmacao(String telefone, String clienteNome, String servicoNome,
                                String funcionarioNome, LocalDate data, LocalTime hora) {
        String msg = String.format(
            "✅ *Agendamento confirmado!*\n\nOlá, %s! 👋\n\nSeu agendamento foi marcado:\n" +
            "✂️ *Serviço:* %s\n👤 *Profissional:* %s\n📅 *Data:* %s\n🕐 *Horário:* %s\n\n" +
            "Te esperamos! Qualquer dúvida é só chamar aqui. ✨",
            clienteNome, servicoNome, funcionarioNome,
            formatarData(data), hora.format(DateTimeFormatter.ofPattern("HH:mm"))
        );
        enviar(telefone, msg);
    }

    public void sendLembrete(String telefone, String clienteNome, String servicoNome,
                             String funcionarioNome, LocalTime hora) {
        String msg = String.format(
            "⏰ *Lembrete de agendamento!*\n\nOlá, %s!\n\n" +
            "Daqui a *1 hora* você tem horário na barbearia:\n\n" +
            "✂️ *Serviço:* %s\n👤 *Profissional:* %s\n🕐 *Horário:* %s\n\n" +
            "Não se atrase! Te esperamos. 💈",
            clienteNome, servicoNome, funcionarioNome,
            hora.format(DateTimeFormatter.ofPattern("HH:mm"))
        );
        enviar(telefone, msg);
    }

    public void sendCancelamento(String telefone, String clienteNome, String servicoNome,
                                 LocalDate data, LocalTime hora) {
        String msg = String.format(
            "❌ *Agendamento cancelado*\n\nOlá, %s, seu agendamento de *%s* em %s às %s foi cancelado.\n\n" +
            "Para reagendar, acesse nosso site ou mande uma mensagem. 😊",
            clienteNome, servicoNome, formatarData(data),
            hora.format(DateTimeFormatter.ofPattern("HH:mm"))
        );
        enviar(telefone, msg);
    }

    private void enviar(String telefone, String mensagem) {
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()) return;

        String toFormatado = formatarTelefone(telefone);
        if (toFormatado == null) return;

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
            String credentials = Base64.getEncoder()
                .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            String body = "From=" + encode(fromNumber) +
                          "&To=" + encode("whatsapp:" + toFormatado) +
                          "&Body=" + encode(mensagem);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            // não quebra o fluxo principal
        }
    }

    private String formatarTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) return null;
        String digits = telefone.replaceAll("[^0-9]", "");
        if (digits.startsWith("55") && digits.length() >= 12) return "+" + digits;
        if (digits.length() == 11 || digits.length() == 10) return "+55" + digits;
        return null;
    }

    private String formatarData(LocalDate data) {
        return data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
