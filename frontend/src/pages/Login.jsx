import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [modoCadastro, setModoCadastro] = useState(false)
  const [nome, setNome] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cadastroError, setCadastroError] = useState('')
  const [cadastroSuccess, setCadastroSuccess] = useState('')
  const { login, registrarCliente } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await login(email, password)
    if (result.success) {
      if (result.role === 'FUNCIONARIO' || result.role === 'ADMIN') {
        navigate('/meus-agendamentos')
      } else {
        navigate('/')
      }
    } else {
      setError(result.message)
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setCadastroError('')
    setCadastroSuccess('')

    if (password !== confirmPassword) {
      setCadastroError('As senhas não conferem')
      return
    }

    const result = await registrarCliente({ nome, email, senha: password })
    if (result.success) {
      setCadastroSuccess('Cadastro realizado com sucesso!')
      setTimeout(() => navigate('/'), 1500)
    } else {
      setCadastroError(result.message)
    }
  }

  const inputStyle = {
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    color: '#f5f5f5',
    padding: '0.8rem',
    borderRadius: '4px'
  }

  const labelStyle = {
    color: '#c9a227',
    fontWeight: '500',
    marginBottom: '0.5rem'
  }

  return (
    <div style={{ 
      paddingTop: '100px', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(45,45,45,0.9) 100%), url("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80") center/cover no-repeat'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '8px'
            }}>
              <Card.Body style={{ padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ 
                    color: '#c9a227', 
                    fontFamily: "'Playfair Display', serif",
                    marginBottom: '0.5rem'
                  }}>
                    {modoCadastro ? 'CADASTRO' : 'LOGIN'}
                  </h2>
                  <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                    Barber Premium
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" style={{ backgroundColor: '#721c24', border: 'none', color: '#f5c6cb' }}>
                    {error}
                  </Alert>
                )}

                {cadastroError && (
                  <Alert variant="danger" style={{ backgroundColor: '#721c24', border: 'none', color: '#f5c6cb' }}>
                    {cadastroError}
                  </Alert>
                )}

                {cadastroSuccess && (
                  <Alert variant="success" style={{ backgroundColor: '#1e3a1e', border: 'none', color: '#75b798' }}>
                    {cadastroSuccess}
                  </Alert>
                )}

                {!modoCadastro ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="seu@email.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={labelStyle}>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="••••••••"
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button 
                        type="submit" 
                        className="btn-gold"
                        style={{ padding: '0.8rem 3rem', width: '100%' }}
                      >
                        Entrar
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <Form onSubmit={handleCadastro}>
                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>Nome Completo</Form.Label>
                      <Form.Control
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="Seu nome"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="seu@email.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={labelStyle}>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="••••••••"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={labelStyle}>Confirmar Senha</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                        required
                        placeholder="••••••••"
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button 
                        type="submit" 
                        className="btn-gold"
                        style={{ padding: '0.8rem 3rem', width: '100%' }}
                      >
                        Cadastrar
                      </Button>
                    </div>
                  </Form>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  {!modoCadastro ? (
                    <>
                      <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                        Não tem conta? 
                        <Button 
                          variant="link" 
                          onClick={() => { setModoCadastro(true); setError('') }}
                          style={{ color: '#c9a227', padding: '0 0.3rem' }}
                        >
                          Cadastre-se
                        </Button>
                      </p>
                    </>
                  ) : (
                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                      Já tem conta?
                      <Button 
                        variant="link" 
                        onClick={() => { setModoCadastro(false); setCadastroError('') }}
                        style={{ color: '#c9a227', padding: '0 0.3rem' }}
                      >
                        Entre
                      </Button>
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login