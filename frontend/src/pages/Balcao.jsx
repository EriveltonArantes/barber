import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge } from 'react-bootstrap'

const token = () => localStorage.getItem('barber_token')
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

const HORARIOS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
                  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

function Balcao() {
  const [step, setStep] = useState(1)
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '' })
  const [modoNovo, setModoNovo] = useState(false)

  const [servicos, setServicos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [parceiros, setParceiros] = useState([])
  const [horariosOcupados, setHorariosOcupados] = useState([])

  const [agendamento, setAgendamento] = useState({
    funcionarioId: '', servicoId: '', data: '', hora: '', codigoIndicacao: '', observacoes: ''
  })

  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const hoje = new Date().toISOString().split('T')[0]
  const em60dias = new Date(Date.now() + 60 * 24 * 3600000).toISOString().split('T')[0]

  useEffect(() => {
    fetch('/api/servicos', { headers: authHeaders() }).then(r => r.ok && r.json()).then(d => d && setServicos(d))
    fetch('/api/usuarios/role/FUNCIONARIO', { headers: authHeaders() }).then(r => r.ok && r.json()).then(d => d && setFuncionarios(d))
    fetch('/api/parceiros/ativos', { headers: authHeaders() }).then(r => r.ok && r.json()).then(d => d && setParceiros(d))
  }, [])

  useEffect(() => {
    if (agendamento.funcionarioId && agendamento.data) {
      fetch(`/api/agendamentos/funcionario/${agendamento.funcionarioId}/data?data=${agendamento.data}`, { headers: authHeaders() })
        .then(r => r.ok && r.json())
        .then(d => d && setHorariosOcupados(d.map(a => a.hora.substring(0, 5))))
    }
  }, [agendamento.funcionarioId, agendamento.data])

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert({ type: '', message: '' }), 4000)
  }

  const buscarClientes = async () => {
    if (busca.trim().length < 2) return
    const r = await fetch(`/api/usuarios/clientes/buscar?q=${encodeURIComponent(busca)}`, { headers: authHeaders() })
    if (r.ok) setResultados(await r.json())
  }

  const selecionarCliente = (c) => {
    setClienteSelecionado(c)
    setStep(2)
  }

  const criarClienteRapido = async () => {
    if (!novoCliente.nome.trim()) return showAlert('danger', 'Nome é obrigatório')
    setLoading(true)
    const r = await fetch('/api/usuarios/cliente-rapido', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(novoCliente)
    })
    setLoading(false)
    if (r.ok) {
      const c = await r.json()
      setClienteSelecionado(c)
      setStep(2)
    } else {
      showAlert('danger', 'Erro ao criar cliente')
    }
  }

  const confirmarAgendamento = async () => {
    if (!agendamento.funcionarioId || !agendamento.servicoId || !agendamento.data || !agendamento.hora) {
      return showAlert('danger', 'Preencha todos os campos obrigatórios')
    }
    setLoading(true)
    const payload = {
      clienteId: clienteSelecionado.id,
      funcionarioId: Number(agendamento.funcionarioId),
      servicoId: Number(agendamento.servicoId),
      data: agendamento.data,
      hora: agendamento.hora + ':00',
      codigoIndicacao: agendamento.codigoIndicacao || null,
      observacoes: agendamento.observacoes || null,
      status: 'CONFIRMADO'
    }
    const r = await fetch('/api/agendamentos', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(payload)
    })
    setLoading(false)
    if (r.ok) {
      showAlert('success', `Agendamento criado com sucesso para ${clienteSelecionado.nome}!`)
      setStep(1)
      setBusca('')
      setResultados([])
      setClienteSelecionado(null)
      setNovoCliente({ nome: '', telefone: '', email: '' })
      setModoNovo(false)
      setAgendamento({ funcionarioId: '', servicoId: '', data: '', hora: '', codigoIndicacao: '', observacoes: '' })
    } else {
      const err = await r.json().catch(() => ({}))
      showAlert('danger', err.message || 'Horário indisponível ou erro ao agendar')
    }
  }

  const servicoSelecionado = servicos.find(s => s.id === Number(agendamento.servicoId))

  return (
    <Container className="py-4 mt-5">
      <h2 className="mb-4" style={{ color: '#c9a227' }}>✂ Agendamento Balcão</h2>

      {alert.message && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ type: '', message: '' })}>
          {alert.message}
        </Alert>
      )}

      {/* Step 1: Buscar ou criar cliente */}
      {step === 1 && (
        <Card className="mb-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <Card.Header style={{ background: '#111', color: '#c9a227' }}>
            <strong>Passo 1 — Identificar o cliente</strong>
          </Card.Header>
          <Card.Body>
            {!modoNovo ? (
              <>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Control
                      placeholder="Buscar por nome, e-mail ou telefone..."
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && buscarClientes()}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                    />
                  </Col>
                  <Col md={4} className="d-flex gap-2">
                    <Button variant="outline-warning" onClick={buscarClientes}>Buscar</Button>
                    <Button variant="outline-secondary" onClick={() => setModoNovo(true)}>+ Novo cliente</Button>
                  </Col>
                </Row>

                {resultados.length > 0 && (
                  <Table variant="dark" hover size="sm">
                    <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
                    <tbody>
                      {resultados.map(c => (
                        <tr key={c.id}>
                          <td>{c.nome}</td>
                          <td>{c.email}</td>
                          <td>{c.telefone || '—'}</td>
                          <td>
                            <Button size="sm" variant="warning" onClick={() => selecionarCliente(c)}>
                              Selecionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {resultados.length === 0 && busca.length >= 2 && (
                  <p className="text-secondary">Nenhum cliente encontrado. <Button variant="link" style={{ color: '#c9a227' }} onClick={() => setModoNovo(true)}>Cadastrar novo?</Button></p>
                )}
              </>
            ) : (
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>Nome *</Form.Label>
                    <Form.Control
                      value={novoCliente.nome}
                      onChange={e => setNovoCliente(p => ({ ...p, nome: e.target.value }))}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>Telefone</Form.Label>
                    <Form.Control
                      value={novoCliente.telefone}
                      onChange={e => setNovoCliente(p => ({ ...p, telefone: e.target.value }))}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>E-mail (opcional)</Form.Label>
                    <Form.Control
                      value={novoCliente.email}
                      onChange={e => setNovoCliente(p => ({ ...p, email: e.target.value }))}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} className="d-flex gap-2">
                  <Button variant="warning" onClick={criarClienteRapido} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar e continuar'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setModoNovo(false)}>Voltar</Button>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Step 2: Preencher agendamento */}
      {step === 2 && clienteSelecionado && (
        <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <Card.Header style={{ background: '#111', color: '#c9a227' }} className="d-flex justify-content-between align-items-center">
            <strong>Passo 2 — Preencher agendamento</strong>
            <Button size="sm" variant="outline-secondary" onClick={() => setStep(1)}>← Trocar cliente</Button>
          </Card.Header>
          <Card.Body>
            <div className="mb-3 p-2 rounded" style={{ background: '#2a2a2a', border: '1px solid #444' }}>
              <strong style={{ color: '#c9a227' }}>Cliente:</strong>{' '}
              <span style={{ color: '#fff' }}>{clienteSelecionado.nome}</span>
              {clienteSelecionado.telefone && (
                <Badge bg="secondary" className="ms-2">{clienteSelecionado.telefone}</Badge>
              )}
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#ccc' }}>Serviço *</Form.Label>
                  <Form.Select
                    value={agendamento.servicoId}
                    onChange={e => setAgendamento(p => ({ ...p, servicoId: e.target.value }))}
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                  >
                    <option value="">Selecione...</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} — R$ {s.preco?.toFixed(2)} ({s.duracao}min)</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#ccc' }}>Profissional *</Form.Label>
                  <Form.Select
                    value={agendamento.funcionarioId}
                    onChange={e => setAgendamento(p => ({ ...p, funcionarioId: e.target.value, hora: '' }))}
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                  >
                    <option value="">Selecione...</option>
                    {funcionarios.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#ccc' }}>Data *</Form.Label>
                  <Form.Control
                    type="date"
                    min={hoje}
                    max={em60dias}
                    value={agendamento.data}
                    onChange={e => setAgendamento(p => ({ ...p, data: e.target.value, hora: '' }))}
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#ccc' }}>Código de indicação (parceiro)</Form.Label>
                  <Form.Control
                    placeholder="Ex: JOAO10"
                    value={agendamento.codigoIndicacao}
                    onChange={e => setAgendamento(p => ({ ...p, codigoIndicacao: e.target.value.toUpperCase() }))}
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
                    list="parceiros-list"
                  />
                  <datalist id="parceiros-list">
                    {parceiros.map(p => <option key={p.id} value={p.codigo}>{p.nome}</option>)}
                  </datalist>
                </Form.Group>
              </Col>
            </Row>

            {agendamento.funcionarioId && agendamento.data && (
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#ccc' }}>Horário *</Form.Label>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {HORARIOS.map(h => {
                    const ocupado = horariosOcupados.includes(h)
                    const selecionado = agendamento.hora === h
                    return (
                      <div
                        key={h}
                        onClick={() => !ocupado && setAgendamento(p => ({ ...p, hora: h }))}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: ocupado ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          background: ocupado ? '#333' : selecionado ? '#c9a227' : '#2a2a2a',
                          color: ocupado ? '#555' : selecionado ? '#000' : '#fff',
                          border: selecionado ? '2px solid #c9a227' : '1px solid #444',
                          opacity: ocupado ? 0.5 : 1
                        }}
                      >
                        {h}
                      </div>
                    )
                  })}
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#ccc' }}>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={agendamento.observacoes}
                onChange={e => setAgendamento(p => ({ ...p, observacoes: e.target.value }))}
                style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
              />
            </Form.Group>

            {servicoSelecionado && agendamento.hora && (
              <div className="p-3 mb-3 rounded" style={{ background: '#2a2a2a', border: '1px solid #c9a227' }}>
                <strong style={{ color: '#c9a227' }}>Resumo:</strong>{' '}
                <span style={{ color: '#fff' }}>
                  {clienteSelecionado.nome} — {servicoSelecionado.nome} (R$ {servicoSelecionado.preco?.toFixed(2)})
                  {' '}às {agendamento.hora} em {agendamento.data}
                  {agendamento.codigoIndicacao && <Badge bg="info" className="ms-2">Indicação: {agendamento.codigoIndicacao}</Badge>}
                </span>
              </div>
            )}

            <Button variant="warning" onClick={confirmarAgendamento} disabled={loading} size="lg">
              {loading ? 'Confirmando...' : 'Confirmar agendamento'}
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}

export default Balcao
