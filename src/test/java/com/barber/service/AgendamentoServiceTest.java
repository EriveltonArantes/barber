package com.barber.service;

import com.barber.dto.AgendamentoDTO;
import com.barber.model.Agendamento;
import com.barber.model.Servico;
import com.barber.model.Usuario;
import com.barber.repository.AgendamentoRepository;
import com.barber.repository.ServicoRepository;
import com.barber.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ServicoRepository servicoRepository;

    @InjectMocks
    private AgendamentoService agendamentoService;

    private Agendamento agendamento;
    private AgendamentoDTO agendamentoDTO;
    private Usuario cliente;
    private Usuario funcionario;
    private Servico servico;

    @BeforeEach
    void setUp() {
        cliente = new Usuario();
        cliente.setId(1L);
        cliente.setNome("João Silva");
        cliente.setEmail("joao@email.com");
        cliente.setTelefone("(11) 99999-1111");
        cliente.setRole("CLIENTE");

        funcionario = new Usuario();
        funcionario.setId(2L);
        funcionario.setNome("Marcos Souza");
        funcionario.setEmail("marcos@barber.com");
        funcionario.setRole("FUNCIONARIO");

        servico = new Servico();
        servico.setId(1L);
        servico.setNome("Corte Masculino");
        servico.setDuracao(30);
        servico.setPreco(50.0);

        agendamento = new Agendamento();
        agendamento.setId(1L);
        agendamento.setCliente(cliente);
        agendamento.setFuncionario(funcionario);
        agendamento.setServico(servico);
        agendamento.setData(LocalDate.now().plusDays(1));
        agendamento.setHora(LocalTime.of(10, 0));
        agendamento.setStatus("PENDENTE");

        agendamentoDTO = new AgendamentoDTO();
        agendamentoDTO.setId(1L);
        agendamentoDTO.setClienteId(1L);
        agendamentoDTO.setFuncionarioId(2L);
        agendamentoDTO.setServicoId(1L);
        agendamentoDTO.setData(LocalDate.now().plusDays(1));
        agendamentoDTO.setHora(LocalTime.of(10, 0));
        agendamentoDTO.setStatus("PENDENTE");
    }

    @Test
    void findAll_Success() {
        when(agendamentoRepository.findAll()).thenReturn(Arrays.asList(agendamento));

        var result = agendamentoService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void findByClienteId_Success() {
        when(agendamentoRepository.findByClienteId(1L)).thenReturn(Arrays.asList(agendamento));

        var result = agendamentoService.findByClienteId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void findByFuncionarioId_Success() {
        when(agendamentoRepository.findByFuncionarioId(2L)).thenReturn(Arrays.asList(agendamento));

        var result = agendamentoService.findByFuncionarioId(2L);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void findById_Success() {
        when(agendamentoRepository.findById(1L)).thenReturn(Optional.of(agendamento));

        AgendamentoDTO result = agendamentoService.findById(1L);

        assertNotNull(result);
        assertEquals("PENDENTE", result.getStatus());
    }

    @Test
    void findById_NotFound() {
        when(agendamentoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> agendamentoService.findById(99L));
    }

    @Test
    void save_Success() {
        agendamentoDTO.setId(null);
        when(agendamentoRepository.existsByFuncionarioIdAndDataAndHora(any(), any(), any())).thenReturn(false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(funcionario));
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));
        when(agendamentoRepository.save(any(Agendamento.class))).thenReturn(agendamento);

        AgendamentoDTO result = agendamentoService.save(agendamentoDTO);

        assertNotNull(result);
        verify(agendamentoRepository).save(any(Agendamento.class));
    }

    @Test
    void save_Failure_HorarioOcupado() {
        agendamentoDTO.setId(null);
        when(agendamentoRepository.existsByFuncionarioIdAndDataAndHora(any(), any(), any())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> agendamentoService.save(agendamentoDTO));
    }

    @Test
    void delete_Success() {
        doNothing().when(agendamentoRepository).deleteById(1L);

        agendamentoService.delete(1L);

        verify(agendamentoRepository).deleteById(1L);
    }

    @Test
    void updateStatus_Success() {
        when(agendamentoRepository.findById(1L)).thenReturn(Optional.of(agendamento));
        when(agendamentoRepository.save(any(Agendamento.class))).thenReturn(agendamento);

        AgendamentoDTO result = agendamentoService.updateStatus(1L, "CONFIRMADO");

        assertNotNull(result);
        assertEquals("CONFIRMADO", agendamento.getStatus());
    }
}