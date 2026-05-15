import { useState } from 'react'
import { Navbar as BSNavbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const [expanded, setExpanded] = useState(false)
  const { user, isAdmin, isFuncionario, isRecepcionista, logout } = useAuth()
  const navigate = useNavigate()

  const close = () => setExpanded(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    close()
  }

  return (
    <BSNavbar expand="lg" fixed="top" className="navbar-custom" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <Container>
        <BSNavbar.Brand as={Link} to="/" onClick={close}>✂ BARBER</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAdmin() ? (
              <>
                <Nav.Link as={Link} to="/" onClick={close}>Início</Nav.Link>
                <Nav.Link as={Link} to="/dashboard" onClick={close}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/meus-agendamentos" onClick={close}>Agendamentos</Nav.Link>
                <Nav.Link as={Link} to="/balcao" onClick={close}>Balcão</Nav.Link>
                <NavDropdown title="Gestão" id="dropdown-gestao" menuVariant="dark">
                  <NavDropdown.Item as={Link} to="/servicos" onClick={close}>Serviços</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/cliente" onClick={close}>Clientes</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/cadastro-funcionario" onClick={close}>Funcionários</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/comissoes" onClick={close}>Comissões</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : isFuncionario() ? (
              <>
                <Nav.Link as={Link} to="/" onClick={close}>Início</Nav.Link>
                <Nav.Link as={Link} to="/meus-agendamentos" onClick={close}>Minha Agenda</Nav.Link>
                <Nav.Link as={Link} to="/balcao" onClick={close}>Balcão</Nav.Link>
                <Nav.Link as={Link} to="/cliente" onClick={close}>Clientes</Nav.Link>
              </>
            ) : isRecepcionista() ? (
              <>
                <Nav.Link as={Link} to="/" onClick={close}>Início</Nav.Link>
                <Nav.Link as={Link} to="/balcao" onClick={close}>Balcão</Nav.Link>
                <Nav.Link as={Link} to="/meus-agendamentos" onClick={close}>Agendamentos</Nav.Link>
                <Nav.Link as={Link} to="/cliente" onClick={close}>Clientes</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" onClick={close}>Início</Nav.Link>
                <Nav.Link href="/#services" onClick={close}>Serviços</Nav.Link>
                <Nav.Link as={Link} to="/agendamento" onClick={close}>Agendamento</Nav.Link>
                {user && <Nav.Link as={Link} to="/meus-agendamentos" onClick={close}>Meus Agendamentos</Nav.Link>}
                <Nav.Link href="/#about" onClick={close}>Sobre</Nav.Link>
                <Nav.Link href="/#contact" onClick={close}>Contato</Nav.Link>
              </>
            )}

            {user ? (
              <Nav.Link onClick={handleLogout} style={{ color: '#c9a227' }}>
                Sair ({user.nome.split(' ')[0]})
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login" onClick={close}>Login</Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar
