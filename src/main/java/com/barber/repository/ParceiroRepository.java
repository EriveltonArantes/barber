package com.barber.repository;

import com.barber.model.Parceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParceiroRepository extends JpaRepository<Parceiro, Long> {
    Optional<Parceiro> findByCodigo(String codigo);
    List<Parceiro> findByAtivoTrue();
}
