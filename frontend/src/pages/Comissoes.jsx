import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Form, Badge, Tabs, Tab, Button } from 'react-bootstrap'

const token = () => localStorage.getItem('barber_token')
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })
const fmt = (v) => `R$ ${Number(v || 0).toFixed(2)}`

function Comissoes() {
  const [diasAtras, setDiasAtras] = useState(30)
  const [dados, setDados] = useState(null)
  const [parceiros, setParceiros] = useState([])
  const [loading, setLoading] = useState(false)

  // gerenciamento de parceiros
  const [form, setForm] = useState({ id: null, nome: '', codigo: '', percentualComissao: '', contato: '', ativo: true })
  const [editando, setEditando] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert({ type: '', message: '' }), 3500)
  }

  const carregarComissoes = async () => {
    setLoading(true)
    const r = await fetch(`/api/agendamentos/comissoes?diasAtras=${diasAtras}`, { headers: authHeaders() })
    if (r.ok) setDados(await r.json())
    setLoading(false)
  }

  const carregarParceiros = async () => {
    const r = await fetch('/api/parceiros', { headers: authHeaders() })
    if (r.ok) setParceiros(await r.json())
  }

  useEffect(() => { carregarComissoes(); carregarParceiros() }, [diasAtras])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const salvarParceiro = async () => {
    if (!form.nome || !form.codigo || !form.percentualComissao) return showAlert('danger', 'Nome, código e % são obrigatórios')
    const url = form.id ? `/api/parceiros/${form.id}` : '/api/parceiros'
    const method = form.id ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...form, percentualComissao: Number(form.percentualComissao) }) })
    if (r.ok) {
      showAlert('success', form.id ? 'Parceiro atualizado!' : 'Parceiro cadastrado!')
      setForm({ id: null, nome: '', codigo: '', percentualComissao: '', contato: '', ativo: true })
      setEditando(false)
      carregarParceiros()
    } else {
      showAlert('danger', 'Erro ao salvar parceiro')
    }
  }

  const editarParceiro = (p) => {
    setForm({ ...p, percentualComissao: p.percentualComissao })
    setEditando(true)
  }

  const deletarParceiro = async (id) => {
    if (!confirm('Excluir este parceiro?')) return
    const r = await fetch(`/api/parceiros/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (r.ok) { showAlert('success', 'Parceiro excluído'); carregarParceiros() }
  }

  const totalFuncionarios = dados?.porFuncionario?.reduce((s, i) => s + i.valorComissao, 0) || 0
  const totalParceiros = dados?.porParceiro?.reduce((s, i) => s + i.valorComissao, 0) || 0

  return (
    <Container className="py-4 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#c9a227' }}>💰 Comissões</h2>
        <Form.Select
          value={diasAtras}
          onChange={e => setDiasAtras(Number(e.target.value))}
          style={{ width: 'auto', background: '#2a2a2a', color: '#fff', border: '1px solid #555' }}
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={15}>Últimos 15 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </Form.Select>
      </div>

      {alert.message && (
        <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ type: '', message: '' })} />
        </div>
      )}

      <Tabs defaultActiveKey="funcionarios" className="mb-3">
        {/* ---- Tab funcionários ---- */}
        <Tab eventKey="funcionarios" title="Por funcionário">
          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Card.Header style={{ background: '#111', color: '#c9a227' }}>
              <strong>Comissões por funcionário</strong>
              {' '}<Badge bg="secondary">Total: {fmt(totalFuncionarios)}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <p className="text-center text-secondary p-3">Carregando...</p>
              ) : dados?.porFuncionario?.length ? (
                <Table variant="dark" hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Funcionário</th>
                      <th className="text-end">Serviços</th>
                      <th className="text-end">Faturamento</th>
                      <th className="text-end">% Comissão</th>
                      <th className="text-end">Valor a pagar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.porFuncionario.map(item => (
                      <tr key={item.funcionarioId}>
                        <td>{item.funcionarioNome}</td>
                        <td className="text-end">{item.quantidadeServicos}</td>
                        <td className="text-end">{fmt(item.faturamentoGerado)}</td>
                        <td className="text-end">
                          {item.percentualComissao > 0
                            ? <Badge bg="info">{item.percentualComissao}%</Badge>
                            : <span className="text-secondary">—</span>}
                        </td>
                        <td className="text-end">
                          <strong style={{ color: '#c9a227' }}>{fmt(item.valorComissao)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #c9a227' }}>
                      <td colSpan={4}><strong style={{ color: '#c9a227' }}>Total</strong></td>
                      <td className="text-end"><strong style={{ color: '#c9a227' }}>{fmt(totalFuncionarios)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              ) : (
                <p className="text-center text-secondary p-3">Nenhum serviço concluído no período.</p>
              )}
            </Card.Body>
          </Card>
          <small className="text-secondary mt-2 d-block">
            * Apenas agendamentos com status CONCLUÍDO são contabilizados. Configure o % por funcionário em Cadastro de Funcionários.
          </small>
        </Tab>

        {/* ---- Tab parceiros ---- */}
        <Tab eventKey="parceiros" title="Por parceiro/indicação">
          <Card className="mb-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Card.Header style={{ background: '#111', color: '#c9a227' }}>
              <strong>Comissões por indicação</strong>
              {' '}<Badge bg="secondary">Total: {fmt(totalParceiros)}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <p className="text-center text-secondary p-3">Carregando...</p>
              ) : dados?.porParceiro?.length ? (
                <Table variant="dark" hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Parceiro</th>
                      <th>Código</th>
                      <th className="text-end">Indicações</th>
                      <th className="text-end">Faturamento</th>
                      <th className="text-end">% Comissão</th>
                      <th className="text-end">Valor a pagar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.porParceiro.map(item => (
                      <tr key={item.parceiroId}>
                        <td>{item.parceiroNome}</td>
                        <td><Badge bg="warning" text="dark">{item.parceiroCodigo}</Badge></td>
                        <td className="text-end">{item.indicacoes}</td>
                        <td className="text-end">{fmt(item.faturamentoGerado)}</td>
                        <td className="text-end"><Badge bg="info">{item.percentualComissao}%</Badge></td>
                        <td className="text-end">
                          <strong style={{ color: '#c9a227' }}>{fmt(item.valorComissao)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #c9a227' }}>
                      <td colSpan={5}><strong style={{ color: '#c9a227' }}>Total</strong></td>
                      <td className="text-end"><strong style={{ color: '#c9a227' }}>{fmt(totalParceiros)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              ) : (
                <p className="text-center text-secondary p-3">Nenhuma indicação com serviço concluído no período.</p>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* ---- Tab gerenciar parceiros ---- */}
        <Tab eventKey="gerenciar" title="Gerenciar parceiros">
          <Card className="mb-4" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Card.Header style={{ background: '#111', color: '#c9a227' }}>
              <strong>{editando ? 'Editar parceiro' : 'Cadastrar parceiro'}</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>Nome *</Form.Label>
                    <Form.Control name="nome" value={form.nome} onChange={handleChange}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>Código *</Form.Label>
                    <Form.Control name="codigo" value={form.codigo}
                      onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                      placeholder="Ex: JOAO10"
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }} />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>% Comissão *</Form.Label>
                    <Form.Control name="percentualComissao" type="number" min="0" max="100" step="0.5"
                      value={form.percentualComissao} onChange={handleChange}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#ccc' }}>Contato</Form.Label>
                    <Form.Control name="contato" value={form.contato} onChange={handleChange}
                      style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #555' }} />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Form.Group className="mb-3">
                    <Form.Check name="ativo" type="checkbox" label="Ativo" checked={form.ativo}
                      onChange={handleChange} style={{ color: '#ccc' }} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button variant="warning" onClick={salvarParceiro}>{editando ? 'Salvar' : 'Cadastrar'}</Button>
                {editando && (
                  <Button variant="outline-secondary"
                    onClick={() => { setForm({ id: null, nome: '', codigo: '', percentualComissao: '', contato: '', ativo: true }); setEditando(false) }}>
                    Cancelar
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <Card.Header style={{ background: '#111', color: '#c9a227' }}><strong>Parceiros cadastrados</strong></Card.Header>
            <Card.Body className="p-0">
              <Table variant="dark" hover className="mb-0">
                <thead>
                  <tr>
                    <th>Nome</th><th>Código</th><th>% Comissão</th><th>Contato</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {parceiros.map(p => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td><Badge bg="warning" text="dark">{p.codigo}</Badge></td>
                      <td>{p.percentualComissao}%</td>
                      <td>{p.contato || '—'}</td>
                      <td>{p.ativo ? <Badge bg="success">Ativo</Badge> : <Badge bg="secondary">Inativo</Badge>}</td>
                      <td>
                        <Button size="sm" variant="outline-warning" className="me-1" onClick={() => editarParceiro(p)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => deletarParceiro(p.id)}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                  {!parceiros.length && (
                    <tr><td colSpan={6} className="text-center text-secondary">Nenhum parceiro cadastrado</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  )
}

export default Comissoes
