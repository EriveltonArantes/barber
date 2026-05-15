package com.barber.dto;

import lombok.Data;

@Data
public class ServicoDTO {
    private Long id;
    private String nome;
    private Integer duracao;
    private Double preco;
    private boolean ativo;
    private String descricao;
    private String photoUrl;
}