package com.barber.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parceiros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Parceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private Double percentualComissao;

    @Column(nullable = false)
    private boolean ativo = true;

    private String contato;
}
