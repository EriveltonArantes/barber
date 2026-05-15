package com.barber.dto;

import lombok.Data;

import java.util.List;

@Data
public class StatsDTO {
    private Long totalAgendamentos;
    private Double faturamentoTotal;
    private Double ticketMedio;
    private Double mediaDiaria;
    private String clienteTop;
    private String servicoTop;
    private String funcionarioTop;
    private List<ItemStats> porServico;
    private List<ItemStats> porFuncionario;
    private List<DiaStats> faturamentoPorDia;

    @Data
    public static class ItemStats {
        private String nome;
        private Long quantidade;
        private Double faturamento;
    }

    @Data
    public static class DiaStats {
        private String data;
        private Long quantidade;
        private Double faturamento;
    }
}
