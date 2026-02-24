package com.barber.dto;

import lombok.Data;

@Data
public class RegistroRequest {
    private String email;
    private String senha;
    private String nome;
    private String role;
    private String telefone;
    private String cpf;
    private String dataNascimento;
    private String endereco;
    private String cidade;
    private String estado;
    private String cep;
}