import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Alert, Badge, Button, Modal } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

// Dados simulados de agendamentos DO FUNCIONÁRIO (exemplo mais completo)
const gerarAgendamentosFuncionario = (funcionarioId) => {
  const hoje = new Date()
  const agendamentos = []
  
  // Gerar agendamentos para vários dias
  for (let dia = -3; dia <= 14; dia++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() + dia)
    const dataStr = data.toISOString().split('T')[0]
    
    // Adicionar alguns agendamentos por dia (apenas para o funcionário específico)
    if (dia >= 0) { // Only future days
      const numAgendamentos = Math.floor(Math.random() * 4) + 1
      const horarios = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
      const servicos = [
        { nome: 'Corte Masculino', preco: 50 },
        { nome: 'Barba Modelada', preco: 40 },
        { nome: 'Corte + Barba', preco: 80 },
        { nome: 'Hidratação', preco: 60 },
        { nome: 'Massagem Relaxante', preco: 70 },
      ]
      const clientes = [
        { nome: 'João Silva', telefone: '(11) 99999-1111' },
        { nome: 'Pedro Santos', telefone: '(11) 99999-2222' },
        { nome: 'Carlos Oliveira', telefone: '(11) 99999-3333' },
        { nome: 'Lucas Mendes', telefone: '(11) 99999-4444' },
        { nome: 'Paulo Costa', telefone: '(11) 99999-5555' },
        { nome: 'Roberto Alves', telefone: '(11) 99999-6666' },
      ]
      
      for (let i = 0; i < numAgendamentos; i++) {
        const horario = horarios[Math.floor(Math.random() * horarios.length)]
        const servico = servicos[Math.floor(Math.random() * servicos.length)]
        const cliente = clientes[Math.floor(Math.random() * clientes.length)]
        
        agendamentos.push({
          id: agendamentos.length + 1,
          clienteNome: cliente.nome,
          clienteTelefone: cliente.telefone,
          servico: servico.nome,
          preco: servico.preco,
          data: dataStr,
          hora: horario,
          status: 'confirmado',
          observacoes: '',
          // O ID do funcionário que vai atender
          funcionarioId: Number(funcionarioId)
        })
      }
    }
  }
  
  return agendamentos.sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data)
    return a.hora.localeCompare(b.hora)
  })
}

function MeusAgendamentos() {
  const { user, isFuncionario, isAdmin, funcionariosCadastrados } = useAuth()
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  const [agendamentos, setAgendamentos] = useState([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Carregar agendamentos simulados para este funcionário
    const idFuncionario = user?.id
    if (idFuncionario !== undefined) {
      const todosAgendamentos = gerarAgendamentosFuncionario(idFuncionario)
      // Filtrar apenas os agendamentos deste funcionário
      const agendamentosFuncionario = todosAgendamentos.filter(a => a.funcionarioId === Number(idFuncionario))
      setAgendamentos(agendamentosFuncionario)
    }
  }, [user])

  // Filtrar agendamentos por data selecionada
  const agendamentosDoDia = useMemo(() => {
    return agendamentos.filter(a => a.data === dataSelecionada)
  }, [agendamentos, dataSelecionada])

  // Obter dias do mês para o calendário
  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const dias = []
    
    // Dias do mês anterior (preencher início da semana)
    const diaSemanaInicio = primeiroDia.getDay()
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const d = new Date(ano, mes, -i)
      dias.push({ data: d, doMes: false })
    }
    
    // Dias do mês atual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const d = new Date(ano, mes, i)
      const dataStr = d.toISOString().split('T')[0]
      const temAgendamento = agendamentos.some(a => a.data === dataStr)
      dias.push({ data: d, doMes: true, temAgendamento, dataStr })
    }
    
    // Dias do próximo mês (preencher final da semana)
    const diaSemanaFim = ultimoDia.getDay()
    for (let i = 1; i < 7 - diaSemanaFim; i++) {
      const d = new Date(ano, mes + 1, i)
      dias.push({ data: d, doMes: false })
    }
    
    return dias
  }, [mesAtual, agendamentos])

  // Estatísticas do dia - AGORA CALCULADO DINÂMICAMENTE
  const estatisticas = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje)
    
    const total = agendamentosHoje.length
    // Calcular faturamento baseado nos serviços realizados HOJE
    const faturamento = agendamentosHoje.reduce((acc, a) => acc + (a.preco || 0), 0)
    
    const ultimoHorario = agendamentosHoje.length > 0 
      ? agendamentosHoje[agendamentosHoje.length - 1].hora 
      : '--:--'
      
    return { total, faturamento, ultimoHorario }
  }, [agendamentos])

  // Formatar data
  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Mês anterior
  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))
  }

  // Próximo mês
  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))
  }

  // Verificar se é hoje
  const isHoje = (dataStr) => {
    return dataStr === new Date().toISOString().split('T')[0]
  }

  // Função para abrir modal com detalhes
  const handleVerAgendamentos = () => {
    setShowModal(true)
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        {/* Título */}
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
              <i className="fas fa-calendar-alt me-2"></i>
              Minha Agenda - {user?.nome}
            </h2>
            <p style={{ color: '#a0a0a0' }}>
              Gerencie seus agendamentos e visualize sua rotina de trabalho
            </p>
          </Col>
        </Row>

        <Row>
          {/* Calendário */}
          <Col lg={4} className="mb-4">
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                {/* Header do Calendário */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Button 
                    variant="link" 
                    onClick={mesAnterior}
                    style={{ color: '#c9a227', textDecoration: 'none', fontSize: '1.2rem' }}
                  >
                    ‹
                  </Button>
                  <h5 style={{ color: '#f5f5f5', marginBottom: 0 }}>
                    {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h5>
                  <Button 
                    variant="link" 
                    onClick={proximoMes}
                    style={{ color: '#c9a227', textDecoration: 'none', fontSize: '1.2rem' }}
                  >
                    ›
                  </Button>
                </div>

                {/* Dias da semana */}
                <div className="calendar-weekdays mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, i) => (
                    <div key={i} className="calendar-weekday" style={{ 
                      color: '#a0a0a0', 
                      fontSize: '0.8rem', 
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Dias do calendário */}
                <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {diasDoMes.map((dia, i) => {
                    const dataStr = dia.data.toISOString().split('T')[0]
                    const isSelected = dataStr === dataSelecionada
                    const isToday = isHoje(dataStr)
                    
                    return (
                      <div
                        key={i}
                        onClick={() => setDataSelecionada(dataStr)}
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#c9a227' : isToday ? '#444' : 'transparent',
                          color: isSelected ? '#1a1a1a' : !dia.doMes ? '#555' : '#f5f5f5',
                          fontWeight: isToday || isSelected ? 'bold' : 'normal',
                          fontSize: '0.9rem',
                          border: isToday && !isSelected ? '1px solid #c9a227' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {dia.data.getDate()}
                        {dia.temAgendamento && !isSelected && (
                          <div style={{ 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            backgroundColor: '#c9a227',
                            margin: '2px auto 0'
                          }}></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Card de Estatísticas do Dia - CLIÁVEL */}
            <Card className="mt-3" style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h6 style={{ color: '#c9a227', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Resumo de Hoje
                </h6>
                <Row className="text-center">
                  <Col xs={4}>
                    <div 
                      onClick={handleVerAgendamentos}
                      style={{ 
                        backgroundColor: '#2d2d2d', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        border: '1px solid #444',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#c9a227'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#444'}
                    >
                      <h4 style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>{estatisticas.total}</h4>
                      <small style={{ color: '#a0a0a0', fontSize: '0.7rem' }}>AGEND.</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div 
                      onClick={handleVerAgendamentos}
                      style={{ 
                        backgroundColor: '#2d2d2d', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        border: '1px solid #444',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#c9a227'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#444'}
                    >
                      <h4 style={{ color: '#28a745', marginBottom: '0.2rem' }}>R$ {estatisticas.faturamento}</h4>
                      <small style={{ color: '#a0a0a0', fontSize: '0.7rem' }}>FATUR.</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div style={{ 
                      backgroundColor: '#2d2d2d', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid #444'
                    }}>
                      <h4 style={{ color: '#c9a227', marginBottom: '0.2rem' }}>{estatisticas.ultimoHorario}</h4>
                      <small style={{ color: '#a0a0a0', fontSize: '0.7rem' }}>ÚLTIMO</small>
                    </div>
                  </Col>
                </Row>
                <p style={{ color: '#777', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.8rem', marginBottom: 0 }}>
                  Clique nos valores para ver detalhes
                </p>
              </Card.Body>
            </Card>
          </Col>

          {/* Agenda do Dia Selecionado */}
          <Col lg={8}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                {/* Header do dia */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>
                      {formatarData(dataSelecionada)}
                    </h4>
                    <p style={{ color: '#a0a0a0', marginBottom: 0 }}>
                      {agendamentosDoDia.length} agendamento(s) previsto(s)
                    </p>
                  </div>
                  <Badge bg={isHoje(dataSelecionada) ? 'success' : 'secondary'} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    {isHoje(dataSelecionada) ? 'HOJE' : new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                  </Badge>
                </div>

                {/* Timeline de horários */}
                {agendamentosDoDia.length > 0 ? (
                  <div className="agenda-timeline">
                    {agendamentosDoDia.map((agendamento, index) => (
                      <div 
                        key={agendamento.id}
                        className="agenda-item"
                        style={{
                          display: 'flex',
                          marginBottom: '1rem',
                          position: 'relative'
                        }}
                      >
                        {/* Linha do tempo */}
                        <div style={{ 
                          width: '80px', 
                          flexShrink: 0,
                          textAlign: 'right',
                          paddingRight: '1rem',
                          borderRight: '2px solid #c9a227'
                        }}>
                          <span style={{ 
                            color: '#c9a227', 
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            {agendamento.hora}
                          </span>
                        </div>
                        
                        {/* Card do agendamento */}
                        <div style={{ 
                          flex: 1,
                          marginLeft: '1rem',
                          backgroundColor: '#2d2d2d',
                          borderRadius: '8px',
                          padding: '1rem',
                          border: '1px solid #444',
                          transition: 'all 0.2s ease'
                        }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 style={{ color: '#f5f5f5', marginBottom: '0.3rem', fontSize: '1rem' }}>
                                {agendamento.clienteNome}
                              </h6>
                              <p style={{ color: '#a0a0a0', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                                <i className="fas fa-phone me-2"></i>
                                {agendamento.clienteTelefone}
                              </p>
                            </div>
                            <Badge bg={agendamento.status === 'confirmado' ? 'success' : 'warning'} style={{ fontSize: '0.75rem' }}>
                              {agendamento.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                            </Badge>
                          </div>
                          <hr style={{ borderColor: '#444', margin: '0.8rem 0' }} />
                          <div className="d-flex justify-content-between align-items-center">
                            <span style={{ color: '#c9a227', fontWeight: '500' }}>
                              <i className="fas fa-scissors me-2"></i>
                              {agendamento.servico}
                            </span>
                            <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1rem' }}>
                              R$ {agendamento.preco}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert style={{ 
                    backgroundColor: '#2d2d2d', 
                    border: '1px solid #444', 
                    color: '#a0a0a0',
                    textAlign: 'center',
                    padding: '3rem'
                  }}>
                    <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#555' }}></i>
                    <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
                      Nenhum agendamento para este dia
                    </p>
                    <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#777' }}>
                      Selecione outro dia no calendário
                    </p>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Próximos dias (mini preview) */}
            <Card className="mt-3" style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #444',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h6 style={{ color: '#a0a0a0', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                  Próximos Dias
                </h6>
                <Row>
                  {[1, 2, 3].map((d) => {
                    const dataProx = new Date()
                    dataProx.setDate(dataProx.getDate() + d)
                    const dataStr = dataProx.toISOString().split('T')[0]
                    const count = agendamentos.filter(a => a.data === dataStr).length
                    
                    return (
                      <Col key={d} xs={4}>
                        <div 
                          onClick={() => setDataSelecionada(dataStr)}
                          style={{ 
                            backgroundColor: dataSelecionada === dataStr ? '#c9a227' : '#2d2d2d',
                            color: dataSelecionada === dataStr ? '#1a1a1a' : '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: '1px solid #444'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: dataSelecionada === dataStr ? '#1a1a1a' : '#a0a0a0' }}>
                            {dataProx.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {dataProx.getDate()}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: dataSelecionada === dataStr ? '#1a1a1a' : '#c9a227' }}>
                            {count} agend.
                          </div>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal de Detalhes dos Agendamentos de Hoje */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #c9a227' }}>
            <Modal.Title style={{ color: '#c9a227' }}>
              Detalhes de Hoje
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#2d2d2d' }}>
            {agendamentos.filter(a => a.data === new Date().toISOString().split('T')[0]).length > 0 ? (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ color: '#f5f5f5', marginBottom: '1rem' }}>Lista de Serviços</h5>
                  {agendamentos.filter(a => a.data === new Date().toISOString().split('T')[0]).map((agendamento, index) => (
                    <div key={agendamento.id} style={{ 
                      backgroundColor: '#1a1a1a', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ color: '#f5f5f5', fontWeight: '500' }}>{agendamento.clienteNome}</span>
                        <br />
                        <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{agendamento.servico}</span>
                      </div>
                      <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        R$ {agendamento.preco}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ 
                  backgroundColor: '#c9a227', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>Total do Dia</h4>
                  <h2 style={{ color: '#1a1a1a', marginBottom: 0 }}>
                    R$ {estatisticas.faturamento}
                  </h2>
                </div>
              </>
            ) : (
              <p style={{ color: '#a0a0a0', textAlign: 'center' }}>
                Nenhum agendamento para hoje.
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#2d2d2d', borderTop: '1px solid #444' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  )
}

export default MeusAgendamentos