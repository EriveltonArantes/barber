package com.barber.repository;

import com.barber.model.Agendamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByClienteId(Long clienteId);

    List<Agendamento> findByFuncionarioId(Long funcionarioId);

    List<Agendamento> findByFuncionarioIdAndData(Long funcionarioId, LocalDate data);

    List<Agendamento> findByStatus(String status);

    boolean existsByFuncionarioIdAndDataAndHora(Long funcionarioId, LocalDate data, LocalTime hora);

    Page<Agendamento> findAll(Pageable pageable);

    List<Agendamento> findByDataBetween(LocalDate inicio, LocalDate fim);

    @Query("SELECT a.servico.nome, COUNT(a), SUM(a.servico.preco) FROM Agendamento a " +
           "WHERE a.data BETWEEN :inicio AND :fim AND a.status <> 'CANCELADO' " +
           "GROUP BY a.servico.nome ORDER BY COUNT(a) DESC")
    List<Object[]> countByServico(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT a.funcionario.nome, COUNT(a), SUM(a.servico.preco) FROM Agendamento a " +
           "WHERE a.data BETWEEN :inicio AND :fim AND a.status <> 'CANCELADO' " +
           "GROUP BY a.funcionario.nome ORDER BY COUNT(a) DESC")
    List<Object[]> countByFuncionario(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT a.cliente.nome, COUNT(a) FROM Agendamento a " +
           "WHERE a.data BETWEEN :inicio AND :fim AND a.status <> 'CANCELADO' " +
           "GROUP BY a.cliente.nome ORDER BY COUNT(a) DESC")
    List<Object[]> countByCliente(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT a.data, COUNT(a), SUM(a.servico.preco) FROM Agendamento a " +
           "WHERE a.data BETWEEN :inicio AND :fim AND a.status <> 'CANCELADO' " +
           "GROUP BY a.data ORDER BY a.data ASC")
    List<Object[]> faturamentoPorDia(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
