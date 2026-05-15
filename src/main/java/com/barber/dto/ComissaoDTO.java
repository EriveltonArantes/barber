package com.barber.dto;

import lombok.Data;
import java.util.List;

@Data
public class ComissaoDTO {
    private List<ItemFuncionario> porFuncionario;
    private List<ItemParceiro> porParceiro;

    @Data
    public static class ItemFuncionario {
        private Long funcionarioId;
        private String funcionarioNome;
        private long quantidadeServicos;
        private double faturamentoGerado;
        private double percentualComissao;
        private double valorComissao;
    }

    @Data
    public static class ItemParceiro {
        private Long parceiroId;
        private String parceiroNome;
        private String parceiroCodigo;
        private long indicacoes;
        private double faturamentoGerado;
        private double percentualComissao;
        private double valorComissao;
    }
}
