package com.barber.config;

import com.barber.model.Servico;
import com.barber.model.Usuario;
import com.barber.repository.ServicoRepository;
import com.barber.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ServicoRepository servicoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, ServicoRepository servicoRepository, 
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Criar usuário admin se não existir
        if (!usuarioRepository.existsByEmail("admin@barber.com")) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@barber.com");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setNome("Administrador");
            admin.setRole("ADMIN");
            admin.setTelefone("(11) 99999-0000");
            usuarioRepository.save(admin);
        }

        // Criar funcionários padrão se não existirem
        if (usuarioRepository.findByRole("FUNCIONARIO").isEmpty()) {
            Usuario func1 = new Usuario();
            func1.setEmail("marcos@barber.com");
            func1.setSenha(passwordEncoder.encode("123456"));
            func1.setNome("Marcos Souza");
            func1.setRole("FUNCIONARIO");
            func1.setTelefone("(11) 99999-1001");
            usuarioRepository.save(func1);

            Usuario func2 = new Usuario();
            func2.setEmail("ricardo@barber.com");
            func2.setSenha(passwordEncoder.encode("123456"));
            func2.setNome("Ricardo Alves");
            func2.setRole("FUNCIONARIO");
            func2.setTelefone("(11) 99999-1002");
            usuarioRepository.save(func2);
        }

        // Criar serviços padrão se não existirem
        if (servicoRepository.findAll().isEmpty()) {
            Servico servico1 = new Servico();
            servico1.setNome("Corte Masculino");
            servico1.setDuracao(30);
            servico1.setPreco(50.0);
            servico1.setAtivo(true);
            servicoRepository.save(servico1);

            Servico servico2 = new Servico();
            servico2.setNome("Barba Modelada");
            servico2.setDuracao(30);
            servico2.setPreco(40.0);
            servico2.setAtivo(true);
            servicoRepository.save(servico2);

            Servico servico3 = new Servico();
            servico3.setNome("Corte + Barba");
            servico3.setDuracao(60);
            servico3.setPreco(80.0);
            servico3.setAtivo(true);
            servicoRepository.save(servico3);

            Servico servico4 = new Servico();
            servico4.setNome("Tratamento Capilar");
            servico4.setDuracao(45);
            servico4.setPreco(60.0);
            servico4.setAtivo(true);
            servicoRepository.save(servico4);

            Servico servico5 = new Servico();
            servico5.setNome("Massagem Relaxante");
            servico5.setDuracao(40);
            servico5.setPreco(70.0);
            servico5.setAtivo(true);
            servicoRepository.save(servico5);
        }
    }
}