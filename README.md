# Barber Shop Management System

Sistema completo de gerenciamento de barbearia com frontend React e backend Spring Boot.
Pronto para produção — dados reais, CRUD completo, autenticação JWT e 29 testes passando.

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool rápido para desenvolvimento
- **React Router** - Roteamento de páginas
- **Context API** - Gerenciamento de estado global
- **CSS3** - Estilização responsiva

### Backend
- **Spring Boot 3.2.0** - Framework Java para desenvolvimento backend
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **JWT** - Tokens de autenticação
- **H2 Database** - Banco de dados em memória (desenvolvimento)
- **Maven** - Gerenciador de dependências

## 📋 Pré-requisitos

- Java 21+
- Node.js 18+
- Maven 3.8+

## 🎯 Como Executar

### Backend (Porta 8080)

```
bash
# Na raiz do projeto
./mvnw spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

### Frontend (Porta 5173)

```
bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 🔐 Credenciais Padrão

| Tipo | Email | Senha |
|------|-------|-------|
| Administrador | admin@barber.com | admin123 |
| Funcionário | funcionario@barber.com | func123 |
| Cliente | cliente@barber.com | cliente123 |

## 📱 Funcionalidades

### Cliente
- ✅ Login e Cadastro
- ✅ Visualizar serviços disponíveis
- ✅ Agendar horários com verificação real de disponibilidade
- ✅ Cancelar agendamentos
- ✅ Visualizar histórico de agendamentos

### Funcionário
- ✅ Login
- ✅ Visualizar agenda do dia (dados reais da API)
- ✅ Gerenciar agendamentos

### Administrador
- ✅ Dashboard com dados reais dos agendamentos
- ✅ Cadastrar/editar/remover funcionários (com credenciais de login)
- ✅ Cadastrar/editar/remover clientes
- ✅ CRUD completo de serviços (ativar/desativar)
- ✅ Gerenciar todos os agendamentos
- ✅ Menus de navegação separados por perfil (admin/funcionário/cliente)

## 🔗 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login de usuário |
| POST | `/api/auth/registro` | Cadastrar novo cliente |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/usuarios` | Listar usuários (admin) |
| GET | `/api/usuarios/{id}` | Buscar usuário por ID |
| POST | `/api/usuarios` | Criar usuário |
| PUT | `/api/usuarios/{id}` | Atualizar usuário |
| DELETE | `/api/usuarios/{id}` | Deletar usuário |

### Serviços
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/servicos` | Listar serviços |
| GET | `/api/servicos/{id}` | Buscar serviço por ID |
| POST | `/api/servicos` | Criar serviço (admin) |
| PUT | `/api/servicos/{id}` | Atualizar serviço |
| DELETE | `/api/servicos/{id}` | Deletar serviço |

### Agendamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/agendamentos` | Listar agendamentos |
| GET | `/api/agendamentos/{id}` | Buscar agendamento |
| POST | `/api/agendamentos` | Criar agendamento |
| PUT | `/api/agendamentos/{id}` | Atualizar agendamento |
| DELETE | `/api/agendamentos/{id}` | Cancelar agendamento |
| GET | `/api/agendamentos/cliente/{id}` | Agendamentos do cliente |
| GET | `/api/agendamentos/disponiveis` | Horários disponíveis |

## 🧪 Testes

```bash
# Executar todos os testes (29 testes, 0 falhas)
./mvnw test
```

Cobertura atual: **29/29 testes passando**

| Classe | Testes |
|--------|--------|
| `AuthControllerTest` | 4 (integração com Spring Security real) |
| `AuthServiceTest` | 4 |
| `AgendamentoServiceTest` | 9 |
| `ServicoServiceTest` | 6 |
| `BarberApplicationTests` | 6 |

## 📁 Estrutura do Projeto

```
barber/
├── src/
│   ├── main/
│   │   ├── java/com/barber/
│   │   │   ├── config/          # Configurações
│   │   │   ├── controller/      # Controllers REST
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── model/            # Entidades
│   │   │   ├── repository/      # Repositórios JPA
│   │   │   ├── security/        # Segurança JWT
│   │   │   └── service/          # Lógica de negócio
│   │   └── resources/
│   │       └── application.yaml # Configurações
│   └── test/                    # Testes unitários
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── context/             # Contextos
│   │   └── pages/               # Páginas
│   ├── package.json
│   └── vite.config.js
├── pom.xml
└── README.md
```

## 🔧 Variáveis de Ambiente

### Backend (application.yaml)
```
yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:barberdb
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true

jwt:
  secret: BarberShop2024SecretKeyVeryLongForHS256Algorithm
  expiration: 86400000
```

## 🌿 Branches

| Branch | Descrição |
|--------|-----------|
| `master` | Produção — código estável e testado |
| `feature/backend-improvements` | GlobalExceptionHandler + SecurityConfig + pom.xml |
| `feature/frontend-auth-fix` | Login async/await e comparação de role correta |
| `feature/frontend-real-data` | Agendamento, Dashboard e MeusAgendamentos com dados reais |
| `feature/admin-pages` | Página Serviços + Navbar por perfil + UI admin completa |
| `feature/fix-tests` | 29/29 testes passando |

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.