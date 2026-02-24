package com.barber.service;

import com.barber.dto.ServicoDTO;
import com.barber.model.Servico;
import com.barber.repository.ServicoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicoServiceTest {

    @Mock
    private ServicoRepository servicoRepository;

    @InjectMocks
    private ServicoService servicoService;

    private Servico servico;
    private ServicoDTO servicoDTO;

    @BeforeEach
    void setUp() {
        servico = new Servico();
        servico.setId(1L);
        servico.setNome("Corte Masculino");
        servico.setDuracao(30);
        servico.setPreco(50.0);
        servico.setAtivo(true);

        servicoDTO = new ServicoDTO();
        servicoDTO.setId(1L);
        servicoDTO.setNome("Corte Masculino");
        servicoDTO.setDuracao(30);
        servicoDTO.setPreco(50.0);
        servicoDTO.setAtivo(true);
    }

    @Test
    void findAll_Success() {
        when(servicoRepository.findAll()).thenReturn(Arrays.asList(servico));

        List<ServicoDTO> result = servicoService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Corte Masculino", result.get(0).getNome());
    }

    @Test
    void findAtivos_Success() {
        when(servicoRepository.findByAtivoTrue()).thenReturn(Arrays.asList(servico));

        List<ServicoDTO> result = servicoService.findAtivos();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isAtivo());
    }

    @Test
    void findById_Success() {
        when(servicoRepository.findById(1L)).thenReturn(Optional.of(servico));

        ServicoDTO result = servicoService.findById(1L);

        assertNotNull(result);
        assertEquals("Corte Masculino", result.getNome());
    }

    @Test
    void findById_NotFound() {
        when(servicoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> servicoService.findById(99L));
    }

    @Test
    void save_Success() {
        when(servicoRepository.save(any(Servico.class))).thenReturn(servico);

        ServicoDTO result = servicoService.save(servicoDTO);

        assertNotNull(result);
        assertEquals("Corte Masculino", result.getNome());
        verify(servicoRepository).save(any(Servico.class));
    }

    @Test
    void delete_Success() {
        doNothing().when(servicoRepository).deleteById(1L);

        servicoService.delete(1L);

        verify(servicoRepository).deleteById(1L);
    }
}