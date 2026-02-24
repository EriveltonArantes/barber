package com.barber.repository;

import com.barber.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByClienteId(Long clienteId);
    List<Agendamento> findByFuncionarioId(Long funcionarioId);
    List<Agendamento> findByFuncionarioIdAndData(Long funcionarioId, LocalDate data);
    List<Agendamento> findByStatus(String status);
    boolean existsByFuncionarioIdAndDataAndHora(Long funcionarioId, LocalDate data, java.time.LocalTime hora);
}