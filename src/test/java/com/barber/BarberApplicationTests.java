package com.barber;

import com.barber.dto.LoginRequest;
import com.barber.model.Servico;
import com.barber.model.Usuario;
import com.barber.repository.ServicoRepository;
import com.barber.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BarberApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void testAuthLogin_Success() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@barber.com");
        loginRequest.setSenha("admin123");

        HttpEntity<LoginRequest> request = new HttpEntity<>(loginRequest, headers);

        var response = restTemplate.postForEntity(
            "http://localhost:" + port + "/api/auth/login",
            request,
            String.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("token"));
    }

    @Test
    void testAuthLogin_Failure() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("invalid@email.com");
        loginRequest.setSenha("wrongpassword");

        HttpEntity<LoginRequest> request = new HttpEntity<>(loginRequest, headers);

        var response = restTemplate.postForEntity(
            "http://localhost:" + port + "/api/auth/login",
            request,
            String.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testDatabaseInitialization() {
        // Verify admin user was created
        assertTrue(usuarioRepository.existsByEmail("admin@barber.com"));
        
        // Verify employees were created
        assertFalse(usuarioRepository.findByRole("FUNCIONARIO").isEmpty());
        
        // Verify services were created
        assertFalse(servicoRepository.findAll().isEmpty());
    }

    @Test
    void testServicoRepository() {
        Servico servico = new Servico();
        servico.setNome("Test Service");
        servico.setDuracao(30);
        servico.setPreco(50.0);
        servico.setAtivo(true);
        
        Servico saved = servicoRepository.save(servico);
        
        assertNotNull(saved.getId());
        assertEquals("Test Service", saved.getNome());
        
        servicoRepository.delete(saved);
    }

    @Test
    void testUsuarioRepository() {
        Usuario usuario = new Usuario();
        usuario.setEmail("test@integration.com");
        usuario.setSenha("test123");
        usuario.setNome("Test User");
        usuario.setRole("CLIENTE");
        
        Usuario saved = usuarioRepository.save(usuario);
        
        assertNotNull(saved.getId());
        assertTrue(usuarioRepository.existsByEmail("test@integration.com"));
        
        usuarioRepository.delete(saved);
    }
}
