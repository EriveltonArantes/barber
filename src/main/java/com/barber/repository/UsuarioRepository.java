package com.barber.repository;

import com.barber.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByRole(String role);

    @Query("SELECT u FROM Usuario u WHERE u.role = 'CLIENTE' AND " +
           "(LOWER(u.nome) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "u.email LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "u.telefone LIKE CONCAT('%', :q, '%'))")
    List<Usuario> buscarClientes(@Param("q") String q);
}