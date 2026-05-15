package com.barber.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AgendamentoDTO {
    private Long id;
    private Long clienteId;
    private String clienteNome;
    private String clienteTelefone;
    private Long clienteCpf;
    private Long funcionarioId;
    private String funcionarioNome;
    private Long servicoId;
    private String servicoNome;
    private Double servicoPreco;
    private Integer servicoDuracao;
    private LocalDate data;
    private LocalTime hora;
    private String status;
    private String observacoes;
    private Long parceiroId;
    private String parceiroNome;
    private String codigoIndicacao;
}