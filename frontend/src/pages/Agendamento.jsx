import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

const gerarHorarios = () => {
  const horarios = []
  for (let h = 9; h < 18; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`)
    horarios.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return horarios
}
const horariosDisponiveis = gerarHorarios()

const hoje = new Date()
const minData = new Date(hoje)
minData.setDate(hoje.getDate() + 1)
const maxData = new Date(hoje)
maxData.setDate(hoje.getDate() + 60)
const toDateStr = (d) => d.toISOString().split('T')[0]

function Agendamento() {
  const { user, funcionarios, fetchFuncionarios, apiFetch } = useAuth()
  const [servicos, setServicos] = useState([])
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horaSelecionada, setHoraSelecionada] = useState('')
  const [horariosLivres, setHorariosLivres] = useState([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFuncionarios()
    fetch('/api/servicos/ativos')
      .then(r => r.ok ? r.json() : [])
      .then(data => setServicos(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!funcionarioSelecionado || !dataSelecionada) return

    // bloquear domingos
    const diaSemana = new Date(dataSelecionada + 'T00:00:00').getDay()
    if (diaSemana === 0) {
      setHorariosLivres([])
      setHoraSelecionada('')
      return
    }

    setCarregandoHorarios(true)
    apiFetch(`/api/agendamentos/funcionario/${funcionarioSelecionado}/data?data=${dataSelecionada}`)
      .then(r => r.ok ? r.json() : [])
      .then(ocupados => {
        const horariosOcupados = ocupados.map(a => a.hora.substring(0, 5))
        setHorariosLivres(horariosDisponiveis.filter(h => !horariosOcupados.includes(h)))
        setHoraSelecionada('')
      })
      .catch(() => {
        setHorariosLivres(horariosDisponiveis)
        setHoraSelecionada('')
      })
      .finally(() => setCarregandoHorarios(false))
  }, [funcionarioSelecionado, dataSelecionada])

  const handleDataChange = (e) => {
    const val = e.target.value
    setDataSelecionada(val)
    setHoraSelecionada('')
    setHorariosLivres([])
  }

  const handleAgendar = async (e) => {
    e.preventDefault()
    if (!user) {
      setAlertData({ type: 'danger', message: 'Você precisa estar logado para agendar' })
      return
    }

    const diaSemana = new Date(dataSelecionada + 'T00:00:00').getDay()
    if (diaSemana === 0) {
      setAlertData({ type: 'danger', message: 'Não atendemos aos domingos.' })
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch('/api/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          clienteId: user.id,
          funcionarioId: parseInt(funcionarioSelecionado),
          servicoId: parseInt(servicoSelecionado),
          data: dataSelecionada,
          hora: horaSelecionada,
          status: 'CONFIRMADO'
        })
      })

      if (!response.ok) throw new Error()

      setAlertData({ type: 'success', message: 'Agendamento realizado! Você receberá um e-mail de confirmação.' })
      setServicoSelecionado('')
      setFuncionarioSelecionado('')
      setDataSelecionada('')
      setHoraSelecionada('')
      setHorariosLivres([])
    } catch {
      setAlertData({ type: 'danger', message: 'Erro ao realizar agendamento. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    color: '#f5f5f5',
    padding: '0.8rem',
    borderRadius: '4px'
  }
  const labelStyle = { color: '#c9a227', fontWeight: '500', marginBottom: '0.5rem' }

  const servicoObj = servicos.find(s => s.id === parseInt(servicoSelecionado))
  const funcionarioObj = funcionarios.find(f => f.id === parseInt(funcionarioSelecionado))

  if (!user) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: '#c9a227', marginBottom: '1rem' }}>Agendamento</h2>
                <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>
                  Você precisa estar logado para fazer um agendamento.
                </p>
                <Button href="/login" className="btn-gold">Fazer Login</Button>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>Agendamento</h2>
            <p style={{ color: '#a0a0a0' }}>Olá, {user.nome}! Escolha o serviço e horário.</p>
          </Col>
        </Row>

        {alertData.message && (
          <Alert variant={alertData.type} style={{
            backgroundColor: alertData.type === 'success' ? '#1e3a1e' : '#3a1e1e',
            border: 'none', color: '#f5f5f5'
          }}>
            {alertData.message}
          </Alert>
        )}

        <Row>
          <Col lg={7}>
            <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '8px' }}>
              <Card.Body style={{ padding: '2rem' }}>
                <Form onSubmit={handleAgendar}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Serviço *</Form.Label>
                        <Form.Select value={servicoSelecionado} onChange={e => setServicoSelecionado(e.target.value)} style={inputStyle} required>
                          <option value="">Selecione um serviço</option>
                          {servicos.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.nome} — R$ {s.preco?.toFixed(2)} ({s.duracao} min)
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Profissional *</Form.Label>
                        <Form.Select value={funcionarioSelecionado} onChange={e => setFuncionarioSelecionado(e.target.value)} style={inputStyle} required>
                          <option value="">Selecione um profissional</option>
                          {funcionarios.map(f => (
                            <option key={f.id} value={f.id}>{f.nome}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Data *</Form.Label>
                        <Form.Control
                          type="date"
                          value={dataSelecionada}
                          onChange={handleDataChange}
                          min={toDateStr(minData)}
                          max={toDateStr(maxData)}
                          style={{ ...inputStyle, colorScheme: 'dark' }}
                          required
                          disabled={!funcionarioSelecionado}
                        />
                        {!funcionarioSelecionado && (
                          <Form.Text style={{ color: '#a0a0a0', fontSize: '0.8rem' }}>Selecione um profissional primeiro</Form.Text>
                        )}
                        {dataSelecionada && new Date(dataSelecionada + 'T00:00:00').getDay() === 0 && (
                          <Form.Text style={{ color: '#dc3545', fontSize: '0.8rem' }}>Domingos não disponíveis</Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Horário *
                          {carregandoHorarios && <span style={{ color: '#a0a0a0', fontSize: '0.8rem', marginLeft: '0.5rem' }}>carregando…</span>}
                        </Form.Label>
                        {horariosLivres.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {horariosLivres.map(h => (
                              <div
                                key={h}
                                onClick={() => setHoraSelecionada(h)}
                                style={{
                                  padding: '8px 4px',
                                  textAlign: 'center',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: horaSelecionada === h ? '#c9a227' : '#2d2d2d',
                                  color: horaSelecionada === h ? '#1a1a1a' : '#f5f5f5',
                                  border: `1px solid ${horaSelecionada === h ? '#c9a227' : '#444'}`,
                                  fontWeight: horaSelecionada === h ? 'bold' : 'normal',
                                  fontSize: '0.85rem',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {h}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ backgroundColor: '#2d2d2d', border: '1px solid #444', borderRadius: '4px', padding: '0.8rem', color: '#a0a0a0', fontSize: '0.9rem' }}>
                            {!dataSelecionada ? 'Selecione uma data primeiro' :
                             carregandoHorarios ? 'Buscando horários…' :
                             'Sem horários disponíveis nesta data'}
                          </div>
                        )}
                        <input type="hidden" value={horaSelecionada} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center mt-3">
                    <Button
                      type="submit"
                      className="btn-gold"
                      style={{ padding: '0.8rem 3rem' }}
                      disabled={loading || !servicoSelecionado || !funcionarioSelecionado || !dataSelecionada || !horaSelecionada}
                    >
                      {loading ? 'Confirmando…' : 'Confirmar Agendamento'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Resumo lateral */}
          <Col lg={5} className="mt-4 mt-lg-0">
            <Card style={{ background: 'linear-gradient(145deg, #2a2a2a, #232323)', border: '1px solid #444', borderRadius: '8px' }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.2rem' }}>Resumo do Agendamento</h5>

                {servicoObj && (
                  <div className="mb-3">
                    {servicoObj.photoUrl && (
                      <img
                        src={servicoObj.photoUrl}
                        alt={servicoObj.nome}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.8rem' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                    <div style={{ backgroundColor: '#2d2d2d', padding: '0.8rem', borderRadius: '6px', border: '1px solid #555' }}>
                      <p style={{ color: '#c9a227', fontWeight: 'bold', marginBottom: '0.2rem' }}>{servicoObj.nome}</p>
                      {servicoObj.descricao && <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{servicoObj.descricao}</p>}
                      <div className="d-flex justify-content-between">
                        <Badge bg="secondary">{servicoObj.duracao} min</Badge>
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>R$ {servicoObj.preco?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                  {[
                    ['Profissional', funcionarioObj?.nome],
                    ['Data', dataSelecionada ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : null],
                    ['Horário', horaSelecionada]
                  ].map(([label, valor]) => valor ? (
                    <div key={label} className="d-flex justify-content-between mb-2" style={{ borderBottom: '1px solid #333', paddingBottom: '0.4rem' }}>
                      <span>{label}</span>
                      <span style={{ color: '#f5f5f5', fontWeight: '500' }}>{valor}</span>
                    </div>
                  ) : null)}
                </div>

                {!servicoSelecionado && !funcionarioSelecionado && (
                  <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                    Preencha o formulário ao lado para ver o resumo.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Agendamento
