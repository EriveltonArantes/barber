import { useState } from 'react'
import { Navbar as BSNavbar, Nav, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const { user, isAdmin, isFuncionario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setExpanded(false)
  }

  return (
    <BSNavbar expand="lg" fixed="top" className="navbar-custom" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <Container>
        <BSNavbar.Brand as={Link} to="/">BARBER</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {/* Se for admin, menu simplificado */}
            {isAdmin() ? (
              <>
                <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Início</Nav.Link>
                <Nav.Link as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/cliente" onClick={() => setExpanded(false)}>
                  Cliente
                </Nav.Link>
                <Nav.Link as={Link} to="/cadastro-funcionario" onClick={() => setExpanded(false)}>
                  Funcionário
                </Nav.Link>
                <Nav.Link as={Link} to="/meus-agendamentos" onClick={() => setExpanded(false)}>
                  Meus Agendamentos
                </Nav.Link>
              </>
            ) : (
              <>
                {/* Menu normal para visitantes e clientes */}
                <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Início</Nav.Link>
                <Nav.Link href="#services" onClick={() => setExpanded(false)}>Serviços</Nav.Link>
                <Nav.Link as={Link} to="/agendamento" onClick={() => setExpanded(false)}>Agendamento</Nav.Link>
                <Nav.Link href="#about" onClick={() => setExpanded(false)}>Sobre</Nav.Link>
                <Nav.Link href="#contact" onClick={() => setExpanded(false)}>Contato</Nav.Link>
              </>
            )}
            
            {/* Área de Autenticação */}
            {user ? (
              <Nav.Link 
                onClick={handleLogout}
                style={{ color: '#c9a227 !important' }}
              >
                Sair ({user.nome})
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                Login
              </Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar