package com.barber.dto;

import lombok.Data;

@Data
public class ParceiroDTO {
    private Long id;
    private String nome;
    private String codigo;
    private Double percentualComissao;
    private boolean ativo;
    private String contato;
}
