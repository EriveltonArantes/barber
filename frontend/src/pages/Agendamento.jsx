import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

// Dados simulados de serviços
const servicos = [
  { id: 1, nome: 'Corte Masculino', duracao: 30, preco: 50 },
  { id: 2, nome: 'Barba Modelada', duracao: 30, preco: 40 },
  { id: 3, nome: 'Corte + Barba', duracao: 60, preco: 80 },
  { id: 4, nome: 'Tratamento Capilar', duracao: 45, preco: 60 },
  { id: 5, nome: 'Massagem Relaxante', duracao: 40, preco: 70 },
]

// Horários disponíveis (9h às 18h, a cada 30min)
const gerarHorarios = () => {
  const horarios = []
  for (let h = 9; h < 18; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`)
    horarios.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return horarios
}

const horariosDisponiveis = gerarHorarios()

// Dados simulados de agendamentos (em produção viria do backend)
let agendamentos = [
  { id: 1, clienteId: 1, clienteNome: 'João Silva', clienteTelefone: '(11) 99999-1111', funcionarioId: 1, funcionarioNome: 'Marcos Souza', servico: 'Corte Masculino', data: '2024-01-15', hora: '10:00' },
  { id: 2, clienteId: 1, clienteNome: 'João Silva', clienteTelefone: '(11) 99999-1111', funcionarioId: 1, funcionarioNome: 'Marcos Souza', servico: 'Barba Modelada', data: '2024-01-15', hora: '14:00' },
]

function Agendamento() {
  const { user, isCliente, funcionariosCadastrados } = useAuth()
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horaSelecionada, setHoraSelecionada] = useState('')
  const [horariosLivres, setHorariosLivres] = useState([])
  const [alert, setAlert] = useState({ type: '', message: '' })

  // Verifica quais horários estão disponíveis para o funcionário na data
  useEffect(() => {
    if (funcionarioSelecionado && dataSelecionada) {
      const agendamentosFuncionario = agendamentos.filter(
        a => a.funcionarioId === parseInt(funcionarioSelecionado) && a.data === dataSelecionada
      )
      
      const horariosOcupados = agendamentosFuncionario.map(a => a.hora)
      const livres = horariosDisponiveis.filter(h => !horariosOcupados.includes(h))
      setHorariosLivres(livres)
      setHoraSelecionada('')
    }
  }, [funcionarioSelecionado, dataSelecionada])

  // Gerar datas dos próximos 30 dias
  const gerarDatas = () => {
    const datas = []
    const hoje = new Date()
    for (let i = 1; i <= 30; i++) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() + i)
      // Não permitir domingos
      if (data.getDay() !== 0) {
        datas.push(data.toISOString().split('T')[0])
      }
    }
    return datas
  }

  const datasDisponiveis = gerarDatas()

  const handleAgendar = (e) => {
    e.preventDefault()
    
    if (!user) {
      setAlert({ type: 'danger', message: 'Você precisa estar logado para agendar' })
      return
    }

    const servico = servicos.find(s => s.id === parseInt(servicoSelecionado))
    const funcionario = funcionariosCadastrados.find(f => f.id === parseInt(funcionarioSelecionado))

    const novoAgendamento = {
      id: Date.now(),
      clienteId: user.id,
      clienteNome: user.nome,
      clienteTelefone: user.telefone || '(11) 99999-9999',
      funcionarioId: parseInt(funcionarioSelecionado),
      funcionarioNome: funcionario?.nome || 'Profissional',
      servico: servico.nome,
      data: dataSelecionada,
      hora: horaSelecionada,
      status: 'confirmado'
    }

    agendamentos.push(novoAgendamento)
    setAlert({ type: 'success', message: 'Agendamento realizado com sucesso!' })
    
    // Reset form
    setServicoSelecionado('')
    setFuncionarioSelecionado('')
    setDataSelecionada('')
    setHoraSelecionada('')
    setHorariosLivres([])
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

  if (!user) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card style={{ 
                background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
                border: '1px solid #c9a227',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#c9a227', marginBottom: '1rem' }}>Agendamento</h2>
                <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>
                  Você precisa estar logado para fazer um agendamento.
                </p>
                <Button href="/login" className="btn-gold">
                  Fazer Login
                </Button>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
              Agendamento
            </h2>
            <p style={{ color: '#a0a0a0' }}>Olá, {user.nome}! Escolha o serviço e horário.</p>
          </Col>
        </Row>

        {alert.message && (
          <Alert variant={alert.type} style={{ backgroundColor: alert.type === 'success' ? '#1e3a1e' : '#3a1e1e', border: 'none', color: '#f5f5f5' }}>
            {alert.message}
          </Alert>
        )}

        <Card style={{ 
          background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
          border: '1px solid #c9a227',
          borderRadius: '8px'
        }}>
          <Card.Body style={{ padding: '2rem' }}>
            <Form onSubmit={handleAgendar}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>Serviço *</Form.Label>
                    <Form.Select
                      value={servicoSelecionado}
                      onChange={(e) => setServicoSelecionado(e.target.value)}
                      style={inputStyle}
                      required
                    >
                      <option value="">Selecione um serviço</option>
                      {servicos.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nome} - R$ {s.preco} ({s.duracao} min)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>Profissional *</Form.Label>
                    <Form.Select
                      value={funcionarioSelecionado}
                      onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                      style={inputStyle}
                      required
                    >
                      <option value="">Selecione um profissional</option>
                      {funcionariosCadastrados.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.nome} {f.telefone && `- ${f.telefone}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>Data *</Form.Label>
                    <Form.Select
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      style={inputStyle}
                      required
                      disabled={!funcionarioSelecionado}
                    >
                      <option value="">Selecione uma data</option>
                      {datasDisponiveis.map(d => (
                        <option key={d} value={d}>
                          {new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </option>
                      ))}
                    </Form.Select>
                    {!funcionarioSelecionado && (
                      <Form.Text style={{ color: '#a0a0a0', fontSize: '0.8rem' }}>
                        Selecione um profissional primeiro
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={labelStyle}>Horário *</Form.Label>
                    <Form.Select
                      value={horaSelecionada}
                      onChange={(e) => setHoraSelecionada(e.target.value)}
                      style={inputStyle}
                      required
                      disabled={horariosLivres.length === 0}
                    >
                      <option value="">Selecione um horário</option>
                      {horariosLivres.map(h => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </Form.Select>
                    {funcionarioSelecionado && dataSelecionada && horariosLivres.length === 0 && (
                      <Form.Text style={{ color: '#dc3545', fontSize: '0.8rem' }}>
                        Sem horários disponíveis nesta data
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {servicoSelecionado && dataSelecionada && horaSelecionada && (
                <Row className="mb-4">
                  <Col>
                    <div style={{ 
                      backgroundColor: '#2d2d2d', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid #c9a227'
                    }}>
                      <h5 style={{ color: '#c9a227', marginBottom: '0.5rem' }}>Resumo do Agendamento</h5>
                      <p style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>
                        <strong>Serviço:</strong> {servicos.find(s => s.id === parseInt(servicoSelecionado))?.nome}
                      </p>
                      <p style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>
                        <strong>Profissional:</strong> {funcionariosCadastrados.find(f => f.id === parseInt(funcionarioSelecionado))?.nome}
                      </p>
                      <p style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>
                        <strong>Data:</strong> {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
                      </p>
                      <p style={{ color: '#f5f5f5', marginBottom: '0' }}>
                        <strong>Horário:</strong> {horaSelecionada}
                      </p>
                    </div>
                  </Col>
                </Row>
              )}

              <div className="text-center">
                <Button 
                  type="submit" 
                  className="btn-gold"
                  style={{ padding: '0.8rem 3rem' }}
                  disabled={!servicoSelecionado || !funcionarioSelecionado || !dataSelecionada || !horaSelecionada || horariosLivres.length === 0}
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Agendamento