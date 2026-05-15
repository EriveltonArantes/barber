import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user, isAdmin, apiFetch } = useAuth()
  const [periodo, setPeriodo] = useState('30')
  const [stats, setStats] = useState(null)
  const [recentes, setRecentes] = useState([])
  const [loading, setLoading] = useState(false)

  const carregarStats = async (dias) => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([
        apiFetch(`/api/agendamentos/stats?diasAtras=${dias}`),
        apiFetch('/api/agendamentos/paginated?page=0&size=10')
      ])
      if (sRes.ok) setStats(await sRes.json())
      if (aRes.ok) {
        const page = await aRes.json()
        setRecentes(page.content || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarStats(periodo) }, [periodo])

  const maxFaturamento = stats?.faturamentoPorDia?.length
    ? Math.max(...stats.faturamentoPorDia.map(d => d.faturamento), 1)
    : 1

  const totalPorServico = stats?.porServico?.reduce((s, i) => s + i.quantidade, 0) || 0

  if (!isAdmin()) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
        <Container>
          <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #dc3545', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#dc3545' }}>Acesso Restrito</h2>
            <p style={{ color: '#a0a0a0' }}>Esta área é apenas para administradores.</p>
          </Card>
        </Container>
      </div>
    )
  }

  const cardStyle = { background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '12px' }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>Dashboard Administrativo</h2>
            <p style={{ color: '#a0a0a0' }}>Visão geral do negócio — {user?.nome}</p>
          </Col>
          <Col xs="auto">
            <Form.Select
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              style={{ backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#f5f5f5', width: '200px' }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </Form.Select>
          </Col>
        </Row>

        {loading && <p style={{ color: '#a0a0a0', textAlign: 'center' }}>Carregando…</p>}

        {/* Cards KPI */}
        {stats && (
          <>
            <Row className="mb-4 g-3">
              {[
                { label: 'FATURAMENTO TOTAL', value: `R$ ${stats.faturamentoTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#28a745', icon: '💰' },
                { label: 'AGENDAMENTOS', value: stats.totalAgendamentos, color: '#f5f5f5', icon: '📅' },
                { label: 'TICKET MÉDIO', value: `R$ ${stats.ticketMedio?.toFixed(2)}`, color: '#17a2b8', icon: '📊' },
                { label: 'MÉDIA/DIA', value: stats.mediaDiaria?.toFixed(1), color: '#ffc107', icon: '📈' }
              ].map(({ label, value, color, icon }) => (
                <Col md={3} key={label}>
                  <Card style={cardStyle}>
                    <Card.Body style={{ padding: '1.5rem' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.8rem' }}>{label}</p>
                          <h3 style={{ color, marginBottom: 0 }}>{value}</h3>
                        </div>
                        <div style={{ fontSize: '2.2rem' }}>{icon}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Gráfico de barras (faturamento por dia) */}
            <Row className="mb-4">
              <Col lg={8}>
                <Card style={cardStyle}>
                  <Card.Body style={{ padding: '1.5rem' }}>
                    <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>Faturamento por Dia</h5>
                    {stats.faturamentoPorDia?.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', padding: '0 0.5rem' }}>
                        {stats.faturamentoPorDia.map((d, i) => {
                          const altura = (d.faturamento / maxFaturamento) * 150
                          const data = new Date(d.data + 'T00:00:00')
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                              <span style={{ color: '#28a745', fontSize: '0.65rem', marginBottom: '3px' }}>R${d.faturamento?.toFixed(0)}</span>
                              <div title={`${d.data}: R$${d.faturamento?.toFixed(2)} (${d.quantidade} ag.)`} style={{ width: '80%', maxWidth: '36px', height: `${altura || 4}px`, backgroundColor: '#c9a227', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                              <span style={{ color: '#a0a0a0', fontSize: '0.65rem', marginTop: '4px' }}>{data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>Sem dados no período</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Records */}
              <Col lg={4}>
                <Card style={cardStyle}>
                  <Card.Body style={{ padding: '1.5rem' }}>
                    <h5 style={{ color: '#c9a227', marginBottom: '1.2rem' }}>Records do Período</h5>
                    {[
                      { icon: '👤', label: 'Melhor Cliente', valor: stats.clienteTop },
                      { icon: '✂️', label: 'Serviço Top', valor: stats.servicoTop },
                      { icon: '🏆', label: 'Melhor Profissional', valor: stats.funcionarioTop }
                    ].map(({ icon, label, valor }) => (
                      <div key={label} className="mb-3">
                        <div style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{icon} {label}</div>
                        <div style={{ backgroundColor: '#2d2d2d', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #444', color: valor ? '#f5f5f5' : '#555', fontWeight: '500' }}>
                          {valor || 'Sem dados'}
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Distribuição por Serviço e Funcionário */}
            <Row className="mb-4">
              {[
                { titulo: 'Distribuição por Serviço', dados: stats.porServico, total: totalPorServico },
                { titulo: 'Performance por Profissional', dados: stats.porFuncionario, total: stats.porFuncionario?.reduce((s, i) => s + i.quantidade, 0) || 0 }
              ].map(({ titulo, dados, total }) => (
                <Col lg={6} key={titulo}>
                  <Card style={cardStyle}>
                    <Card.Body style={{ padding: '1.5rem' }}>
                      <h5 style={{ color: '#c9a227', marginBottom: '1.2rem' }}>{titulo}</h5>
                      {dados?.length > 0 ? dados.map((item, i) => {
                        const cores = ['#c9a227', '#28a745', '#17a2b8', '#dc3545', '#ffc107']
                        const pct = total > 0 ? ((item.quantidade / total) * 100).toFixed(1) : 0
                        return (
                          <div key={i} className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                              <span style={{ color: '#f5f5f5', fontSize: '0.9rem' }}>{item.nome}</span>
                              <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{item.quantidade}x · R${item.faturamento?.toFixed(0)}</span>
                            </div>
                            <div style={{ backgroundColor: '#2d2d2d', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: cores[i % cores.length], borderRadius: '4px', transition: 'width 0.5s' }} />
                            </div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.75rem', textAlign: 'right' }}>{pct}%</div>
                          </div>
                        )
                      }) : (
                        <p style={{ color: '#555', textAlign: 'center', padding: '1rem' }}>Sem dados no período</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Tabela de Recentes */}
        <Row>
          <Col>
            <Card style={cardStyle}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1rem' }}>Agendamentos Recentes</h5>
                <Table responsive style={{ color: '#f5f5f5' }}>
                  <thead style={{ backgroundColor: '#2d2d2d', color: '#c9a227' }}>
                    <tr>
                      <th>Data</th><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentes.length > 0 ? recentes.map(ag => (
                      <tr key={ag.id} style={{ borderBottom: '1px solid #444' }}>
                        <td>{new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{ag.hora?.substring(0, 5)}</td>
                        <td>{ag.clienteNome}</td>
                        <td>{ag.servicoNome}</td>
                        <td>{ag.funcionarioNome}</td>
                        <td style={{ color: '#28a745', fontWeight: 'bold' }}>R$ {ag.servicoPreco?.toFixed(2)}</td>
                        <td>
                          <Badge bg={ag.status === 'CONFIRMADO' ? 'success' : ag.status === 'CANCELADO' ? 'danger' : ag.status === 'CONCLUIDO' ? 'primary' : 'warning'}>
                            {ag.status}
                          </Badge>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>Nenhum agendamento encontrado.</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard
