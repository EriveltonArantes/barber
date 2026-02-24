import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

// Dados simulados de agendamentos completos
const gerarDadosCompleto = () => {
  const agendamentos = []
  const servicos = [
    { nome: 'Corte Masculino', preco: 50 },
    { nome: 'Barba Modelada', preco: 40 },
    { nome: 'Corte + Barba', preco: 80 },
    { nome: 'Hidratação', preco: 60 },
    { nome: 'Massagem Relaxante', preco: 70 },
  ]
  const clientes = ['João Silva', 'Pedro Santos', 'Carlos Oliveira', 'Lucas Mendes', 'Paulo Costa', 'Roberto Alves', 'Maria Souza', 'Ana Paula']
  const funcionarios = [
    { id: 1, nome: 'Marcos Souza' },
    { id: 2, nome: 'Ricardo Alves' },
    { id: 3, nome: 'João Pedro' },
  ]

  const hoje = new Date()
  
  // Gerar dados dos últimos 30 dias
  for (let dia = 0; dia < 30; dia++) {
    const data = new Date(hoje)
    data.setDate(hoje.getDate() - dia)
    const dataStr = data.toISOString().split('T')[0]
    
    // Skip domingos
    if (data.getDay() === 0) continue
    
    // 5-15 agendamentos por dia
    const numAgendamentos = Math.floor(Math.random() * 11) + 5
    
    for (let i = 0; i < numAgendamentos; i++) {
      const servico = servicos[Math.floor(Math.random() * servicos.length)]
      const cliente = clientes[Math.floor(Math.random() * clientes.length)]
      const funcionario = funcionarios[Math.floor(Math.random() * funcionarios.length)]
      const hora = `${Math.floor(Math.random() * 9) + 9}:${Math.random() > 0.5 ? '00' : '30'}`
      
      agendamentos.push({
        id: agendamentos.length + 1,
        data: dataStr,
        hora: hora,
        cliente: cliente,
        servico: servico.nome,
        preco: servico.preco,
        funcionario: funcionario.nome,
        status: 'concluido'
      })
    }
  }
  
  return agendamentos.sort((a, b) => b.data.localeCompare(a.data))
}

const todosAgendamentos = gerarDadosCompleto()

function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [periodo, setPeriodo] = useState('30')
  const [dados, setDados] = useState(todosAgendamentos)

  // Filtrar dados por período
  const dadosFiltrados = useMemo(() => {
    const hoje = new Date()
    const dataInicio = new Date(hoje)
    dataInicio.setDate(hoje.getDate() - parseInt(periodo))
    
    return dados.filter(d => new Date(d.data) >= dataInicio)
  }, [periodo, dados])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalAgendamentos = dadosFiltrados.length
    const faturamentoTotal = dadosFiltrados.reduce((acc, d) => acc + d.preco, 0)
    const ticketMedio = totalAgendamentos > 0 ? faturamentoTotal / totalAgendamentos : 0
    
    // Agendamentos por dia
    const porDia = {}
    dadosFiltrados.forEach(d => {
      porDia[d.data] = (porDia[d.data] || 0) + 1
    })
    const mediaDiaria = Object.keys(porDia).length > 0 
      ? (totalAgendamentos / Object.keys(porDia).length).toFixed(1) 
      : 0

    // Cliente mais frequente
    const clientesCount = {}
    dadosFiltrados.forEach(d => {
      clientesCount[d.cliente] = (clientesCount[d.cliente] || 0) + 1
    })
    const clienteTop = Object.entries(clientesCount).sort((a, b) => b[1] - a[1])[0]

    // Serviço mais realizado
    const servicosCount = {}
    dadosFiltrados.forEach(d => {
      servicosCount[d.servico] = (servicosCount[d.servico] || 0) + 1
    })
    const servicoTop = Object.entries(servicosCount).sort((a, b) => b[1] - a[1])[0]

    // Funcionário que mais-atendeu
    const funcCount = {}
    dadosFiltrados.forEach(d => {
      funcCount[d.funcionario] = (funcCount[d.funcionario] || 0) + 1
    })
    const funcTop = Object.entries(funcCount).sort((a, b) => b[1] - a[1])[0]

    return {
      totalAgendamentos,
      faturamentoTotal,
      ticketMedio,
      mediaDiaria,
      clienteTop: clienteTop || ['-', 0],
      servicoTop: servicoTop || ['-', 0],
      funcTop: funcTop || ['-', 0]
    }
  }, [dadosFiltrados])

  // Dados para gráfico de barras (faturamento por dia)
  const dadosGraficoBarras = useMemo(() => {
    const ultimos7Dias = []
    const hoje = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' })
      
      const agendamentosDia = dadosFiltrados.filter(d => d.data === dataStr)
      const faturamentoDia = agendamentosDia.reduce((acc, d) => acc + d.preco, 0)
      
      ultimos7Dias.push({
        dia: diaSemana,
        valor: faturamentoDia,
        quantidade: agendamentosDia.length
      })
    }
    
    return ultimos7Dias
  }, [dadosFiltrados])

  // Dados para gráfico de pizza (serviços)
  const dadosGraficoPizza = useMemo(() => {
    const servicosCount = {}
    dadosFiltrados.forEach(d => {
      servicosCount[d.servico] = (servicosCount[d.servico] || 0) + 1
    })
    
    const cores = ['#c9a227', '#28a745', '#dc3545', '#17a2b8', '#ffc107']
    return Object.entries(servicosCount).map(([nome, valor], i) => ({
      nome,
      valor,
      cor: cores[i % cores.length]
    }))
  }, [dadosFiltrados])

  // Dados para gráfico de pizza (funcionários)
  const dadosGraficoFunc = useMemo(() => {
    const funcCount = {}
    dadosFiltrados.forEach(d => {
      funcCount[d.funcionario] = (funcCount[d.funcionario] || 0) + 1
    })
    
    const cores = ['#c9a227', '#28a745', '#dc3545', '#17a2b8']
    return Object.entries(funcCount).map(([nome, valor], i) => ({
      nome,
      valor,
      cor: cores[i % cores.length]
    }))
  }, [dadosFiltrados])

  // Calcular porcentagem para gráficos pizza
  const totalPizza = dadosGraficoPizza.reduce((acc, d) => acc + d.valor, 0)

  if (!isAdmin()) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
        <Container>
          <Card style={{ 
            background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
            border: '1px solid #dc3545',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#dc3545' }}>Acesso Restrito</h2>
            <p style={{ color: '#a0a0a0' }}>Esta área é apenas para administradores.</p>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
              <i className="fas fa-chart-line me-2"></i>
              Dashboard Administrativo
            </h2>
            <p style={{ color: '#a0a0a0' }}>
              Visão geral do seu negócio - {user?.nome}
            </p>
          </Col>
          <Col xs="auto">
            <Form.Select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              style={{ 
                backgroundColor: '#2d2d2d', 
                border: '1px solid #444', 
                color: '#f5f5f5',
                width: '200px'
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Cards de Estatísticas */}
        <Row className="mb-4">
          <Col md={3}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.85rem' }}>FATURAMENTO TOTAL</p>
                    <h2 style={{ color: '#28a745', marginBottom: 0 }}>R$ {estatisticas.faturamentoTotal.toLocaleString('pt-BR')}</h2>
                  </div>
                  <div style={{ fontSize: '2.5rem', color: '#c9a227' }}>💰</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.85rem' }}>AGENDAMENTOS</p>
                    <h2 style={{ color: '#f5f5f5', marginBottom: 0 }}>{estatisticas.totalAgendamentos}</h2>
                  </div>
                  <div style={{ fontSize: '2.5rem', color: '#c9a227' }}>📅</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.85rem' }}>TICKET MÉDIO</p>
                    <h2 style={{ color: '#17a2b8', marginBottom: 0 }}>R$ {estatisticas.ticketMedio.toFixed(2)}</h2>
                  </div>
                  <div style={{ fontSize: '2.5rem', color: '#c9a227' }}>📊</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#a0a0a0', marginBottom: '0.2rem', fontSize: '0.85rem' }}>MÉDIA/DIA</p>
                    <h2 style={{ color: '#ffc107', marginBottom: 0 }}>{estatisticas.mediaDiaria}</h2>
                  </div>
                  <div style={{ fontSize: '2.5rem', color: '#c9a227' }}>📈</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Gráficos */}
        <Row className="mb-4">
          {/* Gráfico de Barras */}
          <Col lg={8}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>
                  <i className="fas fa-chart-bar me-2"></i>
                  Faturamento dos Últimos 7 Dias
                </h5>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 1rem' }}>
                  {dadosGraficoBarras.map((d, i) => {
                    const maxValor = Math.max(...dadosGraficoBarras.map(d => d.valor))
                    const altura = maxValor > 0 ? (d.valor / maxValor) * 150 : 0
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ 
                          width: '40px', 
                          height: `${altura}px`, 
                          backgroundColor: '#c9a227',
                          borderRadius: '4px 4px 0 0',
                          marginBottom: '0.5rem',
                          transition: 'height 0.3s ease'
                        }}></div>
                        <span style={{ color: '#a0a0a0', fontSize: '0.75rem' }}>{d.dia}</span>
                        <span style={{ color: '#28a745', fontSize: '0.7rem', fontWeight: 'bold' }}>R$ {d.valor}</span>
                      </div>
                    )
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Cards de Records */}
          <Col lg={4}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1rem' }}>
                  <i className="fas fa-trophy me-2"></i>
                  Records do Período
                </h5>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>👤</span>
                    <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Melhor Cliente</span>
                  </div>
                  <div style={{ 
                    backgroundColor: '#2d2d2d', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid #444'
                  }}>
                    <span style={{ color: '#f5f5f5', fontWeight: 'bold' }}>{estatisticas.clienteTop[0]}</span>
                    <span style={{ color: '#c9a227', marginLeft: '0.5rem' }}>({estatisticas.clienteTop[1]}x)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>✂️</span>
                    <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Serviço Mais Pedido</span>
                  </div>
                  <div style={{ 
                    backgroundColor: '#2d2d2d', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid #444'
                  }}>
                    <span style={{ color: '#f5f5f5', fontWeight: 'bold' }}>{estatisticas.servicoTop[0]}</span>
                    <span style={{ color: '#c9a227', marginLeft: '0.5rem' }}>({estatisticas.servicoTop[1]}x)</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🏆</span>
                    <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Melhor Profissional</span>
                  </div>
                  <div style={{ 
                    backgroundColor: '#2d2d2d', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid #444'
                  }}>
                    <span style={{ color: '#f5f5f5', fontWeight: 'bold' }}>{estatisticas.funcTop[0]}</span>
                    <span style={{ color: '#c9a227', marginLeft: '0.5rem' }}>({estatisticas.funcTop[1]} atendimentos)</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Gráficos de Pizza */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>
                  <i className="fas fa-chart-pie me-2"></i>
                  Distribuição por Serviço
                </h5>
                <Row>
                  <Col md={6}>
                    {/* Gráfico Pizza Visual */}
                    <div style={{ 
                      width: '180px', 
                      height: '180px', 
                      borderRadius: '50%', 
                      background: `conic-gradient(${dadosGraficoPizza.map((d, i) => `${d.cor} ${dadosGraficoPizza.slice(0, i).reduce((a, b) => a + (b.valor/totalPizza)*100, 0)}% ${dadosGraficoPizza.slice(0, i+1).reduce((a, b) => a + (b.valor/totalPizza)*100, 0)}%`).join(', ')})`,
                      margin: '0 auto',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: '#2a2a2a', 
                        borderRadius: '50%'
                      }}></div>
                    </div>
                  </Col>
                  <Col md={6}>
                    {dadosGraficoPizza.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: d.cor, 
                          borderRadius: '2px',
                          marginRight: '0.5rem'
                        }}></div>
                        <span style={{ color: '#f5f5f5', flex: 1, fontSize: '0.85rem' }}>{d.nome}</span>
                        <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{((d.valor / totalPizza) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>
                  <i className="fas fa-users me-2"></i>
                  Performance por Funcionário
                </h5>
                <Row>
                  <Col md={6}>
                    {/* Gráfico Pizza Visual */}
                    <div style={{ 
                      width: '180px', 
                      height: '180px', 
                      borderRadius: '50%', 
                      background: `conic-gradient(${dadosGraficoFunc.map((d, i) => `${d.cor} ${dadosGraficoFunc.slice(0, i).reduce((a, b) => a + (b.valor/totalPizza)*100, 0)}% ${dadosGraficoFunc.slice(0, i+1).reduce((a, b) => a + (b.valor/totalPizza)*100, 0)}%`).join(', ')})`,
                      margin: '0 auto',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: '#2a2a2a', 
                        borderRadius: '50%'
                      }}></div>
                    </div>
                  </Col>
                  <Col md={6}>
                    {dadosGraficoFunc.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: d.cor, 
                          borderRadius: '2px',
                          marginRight: '0.5rem'
                        }}></div>
                        <span style={{ color: '#f5f5f5', flex: 1, fontSize: '0.85rem' }}>{d.nome}</span>
                        <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{d.valor} att.</span>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabela de Recentess */}
        <Row>
          <Col>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '12px'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1rem' }}>
                  <i className="fas fa-history me-2"></i>
                  Recentes (Últimos 10)
                </h5>
                <Table responsive style={{ color: '#f5f5f5' }}>
                  <thead style={{ backgroundColor: '#2d2d2d', color: '#c9a227' }}>
                    <tr>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>Profissional</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosFiltrados.slice(0, 10).map(ag => (
                      <tr key={ag.id} style={{ borderBottom: '1px solid #444' }}>
                        <td>{new Date(ag.data).toLocaleDateString('pt-BR')}</td>
                        <td style={{ color: '#c9a227', fontWeight: 'bold' }}>{ag.hora}</td>
                        <td>{ag.cliente}</td>
                        <td>{ag.servico}</td>
                        <td>{ag.funcionario}</td>
                        <td style={{ color: '#28a745', fontWeight: 'bold' }}>R$ {ag.preco}</td>
                        <td>
                          <Badge bg="success">{ag.status}</Badge>
                        </td>
                      </tr>
                    ))}
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