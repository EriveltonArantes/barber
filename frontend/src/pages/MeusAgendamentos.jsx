import { useState, useEffect, useMemo, useCallback } from 'react'
import { Container, Row, Col, Card, Alert, Badge, Button, Modal, Form, InputGroup } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

function MeusAgendamentos() {
  const { user, isFuncionario, isAdmin, isRecepcionista } = useAuth()
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  const [agendamentos, setAgendamentos] = useState([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroPor, setFiltroPor] = useState('cliente') // 'cliente' | 'funcionario'

  const carregarAgendamentos = useCallback(async () => {
    const token = localStorage.getItem('barber_token')
    if (!token || !user) return

    let url = '/api/agendamentos'
    if (!isAdmin() && !isRecepcionista()) {
      url = isFuncionario()
        ? `/api/agendamentos/funcionario/${user.id}`
        : `/api/agendamentos/cliente/${user.id}`
    }

    try {
      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      if (!r.ok) return
      const data = await r.json()
      setAgendamentos(data.map(ag => ({
        id: ag.id,
        clienteNome: ag.clienteNome,
        clienteTelefone: ag.clienteTelefone || '-',
        funcionarioNome: ag.funcionarioNome,
        servico: ag.servicoNome,
        preco: ag.servicoPreco || 0,
        data: ag.data,
        hora: ag.hora ? ag.hora.substring(0, 5) : ag.hora,
        status: ag.status,
        observacoes: ag.observacoes
      })))
    } catch { /* silently ignore */ }
  }, [user, isAdmin, isFuncionario])

  useEffect(() => {
    carregarAgendamentos()
  }, [carregarAgendamentos])

  const cancelarAgendamento = async (id) => {
    if (!window.confirm('Deseja excluir/cancelar este agendamento?')) return
    const token = localStorage.getItem('barber_token')
    try {
      const r = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (r.ok) carregarAgendamentos()
    } catch { /* ignore */ }
  }

  const agendamentosFiltrados = useMemo(() => {
    if (!busca.trim()) return []
    const q = busca.toLowerCase()
    return agendamentos.filter(a =>
      filtroPor === 'cliente'
        ? (a.clienteNome || '').toLowerCase().includes(q)
        : (a.funcionarioNome || '').toLowerCase().includes(q)
    ).sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''))
  }, [busca, filtroPor, agendamentos])

  const agendamentosDoDia = useMemo(() => {
    return agendamentos
      .filter(a => a.data === dataSelecionada)
      .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
  }, [agendamentos, dataSelecionada])

  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const dias = []

    for (let i = primeiroDia.getDay() - 1; i >= 0; i--) {
      dias.push({ data: new Date(ano, mes, -i), doMes: false })
    }
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const d = new Date(ano, mes, i)
      const dataStr = d.toISOString().split('T')[0]
      dias.push({ data: d, doMes: true, temAgendamento: agendamentos.some(a => a.data === dataStr && a.status !== 'CANCELADO'), dataStr })
    }
    for (let i = 1; i < 7 - ultimoDia.getDay(); i++) {
      dias.push({ data: new Date(ano, mes + 1, i), doMes: false })
    }
    return dias
  }, [mesAtual, agendamentos])

  const estatisticas = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0]
    const ativos = agendamentos.filter(a => a.data === hoje && a.status !== 'CANCELADO')
    return {
      total: ativos.length,
      faturamento: ativos.reduce((acc, a) => acc + (a.preco || 0), 0),
      ultimoHorario: ativos.length > 0 ? ativos[ativos.length - 1].hora : '--:--'
    }
  }, [agendamentos])

  const formatarData = (data) =>
    new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMADO': return { bg: 'success', label: 'Confirmado' }
      case 'PENDENTE':   return { bg: 'warning', label: 'Pendente' }
      case 'CANCELADO':  return { bg: 'danger',  label: 'Cancelado' }
      case 'CONCLUIDO':  return { bg: 'primary', label: 'Concluído' }
      default:           return { bg: 'secondary', label: status }
    }
  }

  const isHoje = (d) => d === new Date().toISOString().split('T')[0]

  const cardStyle = { background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '12px' }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
              📅 {isAdmin() || isRecepcionista() ? 'Todos os Agendamentos' : isFuncionario() ? 'Minha Agenda' : 'Meus Agendamentos'} — {user?.nome}
            </h2>
            <p style={{ color: '#a0a0a0' }}>
              {isAdmin() || isRecepcionista() ? 'Visão geral de todos os agendamentos da barbearia' : 'Gerencie sua agenda e visualize seus atendimentos'}
            </p>
          </Col>
        </Row>

        {/* Busca admin / recepcionista */}
        {(isAdmin() || isRecepcionista()) && (
          <Row className="mb-4">
            <Col>
              <Card style={{ background: '#1e1e1e', border: '1px solid #444', borderRadius: '10px' }}>
                <Card.Body className="py-3">
                  <InputGroup>
                    <Form.Select
                      value={filtroPor}
                      onChange={e => setFiltroPor(e.target.value)}
                      style={{ maxWidth: '160px', background: '#2d2d2d', color: '#f5f5f5', border: '1px solid #555' }}
                    >
                      <option value="cliente">Por cliente</option>
                      <option value="funcionario">Por funcionário</option>
                    </Form.Select>
                    <Form.Control
                      placeholder={filtroPor === 'cliente' ? 'Buscar por nome do cliente...' : 'Buscar por funcionário...'}
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      style={{ background: '#2d2d2d', color: '#f5f5f5', border: '1px solid #555' }}
                    />
                    {busca && (
                      <Button variant="outline-secondary" onClick={() => setBusca('')}>✕</Button>
                    )}
                  </InputGroup>
                </Card.Body>
              </Card>

              {busca.trim() && (
                <Card className="mt-2" style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }}>
                  <Card.Body style={{ padding: '1rem' }}>
                    <p style={{ color: '#a0a0a0', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                      {agendamentosFiltrados.length} resultado(s) para "{busca}"
                    </p>
                    {agendamentosFiltrados.length === 0 ? (
                      <p style={{ color: '#555', textAlign: 'center', padding: '1rem 0' }}>Nenhum agendamento encontrado.</p>
                    ) : agendamentosFiltrados.map(ag => {
                      const { bg, label } = getStatusBadge(ag.status)
                      return (
                        <div key={ag.id} style={{ display: 'flex', gap: '1rem', backgroundColor: '#2d2d2d', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '0.5rem', border: '1px solid #444', alignItems: 'center' }}>
                          <div style={{ minWidth: '80px', textAlign: 'center' }}>
                            <div style={{ color: '#c9a227', fontWeight: 'bold', fontSize: '0.9rem' }}>{ag.hora}</div>
                            <div style={{ color: '#888', fontSize: '0.72rem' }}>{new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#f5f5f5', fontWeight: '500' }}>{ag.clienteNome}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.8rem' }}>✂ {ag.servico} · {ag.funcionarioNome}</div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={bg}>{label}</Badge>
                            <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.9rem' }}>R$ {ag.preco?.toFixed(2)}</span>
                            <Button size="sm" variant="outline-danger" style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => cancelarAgendamento(ag.id)}>Excluir</Button>
                          </div>
                        </div>
                      )
                    })}
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        )}

        <Row>
          {/* Calendário */}
          <Col lg={4} className="mb-4">
            <Card style={cardStyle}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Button variant="link" onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
                    style={{ color: '#c9a227', textDecoration: 'none', fontSize: '1.4rem' }}>‹</Button>
                  <h5 style={{ color: '#f5f5f5', marginBottom: 0, textTransform: 'capitalize' }}>
                    {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h5>
                  <Button variant="link" onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
                    style={{ color: '#c9a227', textDecoration: 'none', fontSize: '1.4rem' }}>›</Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
                  {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d, i) => (
                    <div key={i} style={{ color: '#a0a0a0', fontSize: '0.72rem', textAlign: 'center', fontWeight: 'bold', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                  {diasDoMes.map((dia, i) => {
                    const dataStr = dia.data.toISOString().split('T')[0]
                    const isSelected = dataStr === dataSelecionada
                    const isToday = isHoje(dataStr)
                    return (
                      <div key={i} onClick={() => setDataSelecionada(dataStr)} style={{
                        padding: '5px 2px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer',
                        backgroundColor: isSelected ? '#c9a227' : isToday ? '#3d3d3d' : 'transparent',
                        color: isSelected ? '#1a1a1a' : !dia.doMes ? '#555' : '#f5f5f5',
                        fontWeight: isToday || isSelected ? 'bold' : 'normal',
                        fontSize: '0.85rem',
                        border: isToday && !isSelected ? '1px solid #c9a227' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}>
                        {dia.data.getDate()}
                        {dia.temAgendamento && !isSelected && (
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#c9a227', margin: '1px auto 0' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card.Body>
            </Card>

            <Card className="mt-3" style={cardStyle}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h6 style={{ color: '#c9a227', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Resumo de Hoje</h6>
                <Row className="text-center g-2">
                  {[
                    { label: 'AGEND.', value: estatisticas.total, color: '#f5f5f5' },
                    { label: 'FATUR.', value: `R$${estatisticas.faturamento.toFixed(0)}`, color: '#28a745' },
                    { label: 'ÚLTIMO', value: estatisticas.ultimoHorario, color: '#c9a227' },
                  ].map(({ label, value, color }) => (
                    <Col xs={4} key={label}>
                      <div onClick={() => setShowModal(true)} style={{ backgroundColor: '#2d2d2d', padding: '0.8rem 0.3rem', borderRadius: '8px', border: '1px solid #444', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#c9a227'} onMouseOut={e => e.currentTarget.style.borderColor = '#444'}>
                        <div style={{ color, fontWeight: 'bold', fontSize: '0.95rem' }}>{value}</div>
                        <div style={{ color: '#a0a0a0', fontSize: '0.65rem', marginTop: '2px' }}>{label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-3" style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #444', borderRadius: '12px' }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h6 style={{ color: '#a0a0a0', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Próximos Dias</h6>
                <Row className="g-2">
                  {[1, 2, 3].map(d => {
                    const dp = new Date()
                    dp.setDate(dp.getDate() + d)
                    const ds = dp.toISOString().split('T')[0]
                    const count = agendamentos.filter(a => a.data === ds && a.status !== 'CANCELADO').length
                    const sel = dataSelecionada === ds
                    return (
                      <Col key={d} xs={4}>
                        <div onClick={() => setDataSelecionada(ds)} style={{
                          backgroundColor: sel ? '#c9a227' : '#2d2d2d', color: sel ? '#1a1a1a' : '#f5f5f5',
                          padding: '0.8rem 0.3rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', border: '1px solid #444'
                        }}>
                          <div style={{ fontSize: '0.7rem', color: sel ? '#1a1a1a' : '#a0a0a0' }}>
                            {dp.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{dp.getDate()}</div>
                          <div style={{ fontSize: '0.7rem', color: sel ? '#1a1a1a' : '#c9a227' }}>{count} ag.</div>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Agenda do dia */}
          <Col lg={8}>
            <Card style={cardStyle}>
              <Card.Body style={{ padding: '2rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 style={{ color: '#f5f5f5', marginBottom: '0.2rem', textTransform: 'capitalize' }}>{formatarData(dataSelecionada)}</h4>
                    <p style={{ color: '#a0a0a0', marginBottom: 0 }}>
                      {agendamentosDoDia.filter(a => a.status !== 'CANCELADO').length} agendamento(s)
                    </p>
                  </div>
                  <Badge bg={isHoje(dataSelecionada) ? 'success' : 'secondary'} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    {isHoje(dataSelecionada) ? 'HOJE' : new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                  </Badge>
                </div>

                {agendamentosDoDia.length > 0 ? (
                  <div>
                    {agendamentosDoDia.map(ag => {
                      const { bg, label } = getStatusBadge(ag.status)
                      return (
                        <div key={ag.id} style={{ display: 'flex', marginBottom: '1rem' }}>
                          <div style={{ width: '75px', flexShrink: 0, textAlign: 'right', paddingRight: '1rem', borderRight: '2px solid #c9a227' }}>
                            <span style={{ color: '#c9a227', fontWeight: 'bold', fontSize: '1rem' }}>{ag.hora}</span>
                          </div>
                          <div style={{ flex: 1, marginLeft: '1rem', backgroundColor: '#2d2d2d', borderRadius: '8px', padding: '1rem', border: '1px solid #444', opacity: ag.status === 'CANCELADO' ? 0.55 : 1 }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 style={{ color: '#f5f5f5', marginBottom: '0.2rem' }}>{ag.clienteNome}</h6>
                                <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.82rem' }}>📞 {ag.clienteTelefone}</p>
                                {isAdmin() && (
                                  <p style={{ color: '#888', marginBottom: 0, fontSize: '0.78rem' }}>Profissional: {ag.funcionarioNome}</p>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg={bg}>{label}</Badge>
                                {isAdmin() || isRecepcionista() ? (
                                  <Button size="sm" variant="outline-danger" style={{ padding: '1px 8px', fontSize: '0.75rem', lineHeight: '1.5' }}
                                    onClick={() => cancelarAgendamento(ag.id)}>Excluir</Button>
                                ) : ag.status !== 'CANCELADO' && ag.status !== 'CONCLUIDO' && (
                                  <Button size="sm" variant="outline-danger" style={{ padding: '1px 7px', fontSize: '0.75rem', lineHeight: '1.5' }}
                                    onClick={() => cancelarAgendamento(ag.id)}>✕</Button>
                                )}
                              </div>
                            </div>
                            <hr style={{ borderColor: '#444', margin: '0.7rem 0' }} />
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ color: '#c9a227', fontWeight: '500' }}>✂️ {ag.servico}</span>
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>R$ {ag.preco?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Alert style={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#a0a0a0', textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
                    <p style={{ marginBottom: '0.3rem', fontSize: '1.05rem' }}>Nenhum agendamento para este dia</p>
                    <p style={{ marginBottom: 0, fontSize: '0.85rem', color: '#777' }}>Selecione outro dia no calendário</p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal resumo do dia */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid #c9a227' }}>
            <Modal.Title style={{ color: '#c9a227' }}>Detalhes de Hoje</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#2d2d2d' }}>
            {(() => {
              const hoje = new Date().toISOString().split('T')[0]
              const itens = agendamentos.filter(a => a.data === hoje && a.status !== 'CANCELADO')
              return itens.length > 0 ? (
                <>
                  {itens.map(a => (
                    <div key={a.id} style={{ backgroundColor: '#1a1a1a', padding: '0.9rem 1rem', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#f5f5f5', fontWeight: '500' }}>{a.clienteNome}</span>
                        <br />
                        <span style={{ color: '#a0a0a0', fontSize: '0.83rem' }}>{a.hora} — {a.servico}</span>
                      </div>
                      <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.05rem' }}>R$ {a.preco?.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ backgroundColor: '#c9a227', padding: '1.2rem', borderRadius: '8px', textAlign: 'center', marginTop: '1rem' }}>
                    <div style={{ color: '#1a1a1a', fontWeight: '600', marginBottom: '0.3rem' }}>Total do Dia</div>
                    <h2 style={{ color: '#1a1a1a', marginBottom: 0 }}>R$ {estatisticas.faturamento.toFixed(2)}</h2>
                  </div>
                </>
              ) : (
                <p style={{ color: '#a0a0a0', textAlign: 'center', margin: '1rem 0' }}>Nenhum agendamento para hoje.</p>
              )
            })()}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#2d2d2d', borderTop: '1px solid #444' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  )
}

export default MeusAgendamentos
