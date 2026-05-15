package com.barber.model;

import com.barber.model.Parceiro;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "agendamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;
    
    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Usuario funcionario;
    
    @ManyToOne
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;
    
    @Column(nullable = false)
    private LocalDate data;
    
    @Column(nullable = false)
    private LocalTime hora;
    
    @Column(nullable = false)
    private String status; // PENDENTE, CONFIRMADO, CANCELADO, CONCLUIDO

    private String observacoes;

    @Column(nullable = false)
    private boolean reminderSent = false;

    @ManyToOne
    @JoinColumn(name = "parceiro_id")
    private Parceiro parceiro;

    private String codigoIndicacao;
}