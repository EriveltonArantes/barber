package com.barber.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String senha;
    
    @Column(nullable = false)
    private String nome;
    
    @Column(nullable = false)
    private String role; // ADMIN, FUNCIONARIO, CLIENTE
    
    private String telefone;
    private String cpf;
    private String dataNascimento;
    private String endereco;
    private String cidade;
    private String estado;
    private String cep;

    private Double comissaoPercentual;
}