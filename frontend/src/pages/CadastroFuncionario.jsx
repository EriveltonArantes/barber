import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Tab, Tabs, Badge } from 'react-bootstrap'

const removerMascara = (str) => str.replace(/[.\-() ]/g, '').toLowerCase()
const token = () => localStorage.getItem('barber_token')
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

function CadastroFuncionario() {
  const [funcionarios, setFuncionarios] = useState([])
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', telefone: '', cpf: '', dataNascimento: '', endereco: '', cidade: '', estado: '', cep: '', comissaoPercentual: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const carregarFuncionarios = async () => {
    try {
      const r = await fetch('/api/usuarios/role/FUNCIONARIO', { headers: authHeaders() })
      if (r.ok) setFuncionarios(await r.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { carregarFuncionarios() }, [])

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert({ type: '', message: '' }), 3500)
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/usuarios', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...formData, role: 'FUNCIONARIO' })
      })
      if (r.ok) {
        setFormData({ nome: '', email: '', senha: '', telefone: '', cpf: '', dataNascimento: '', endereco: '', cidade: '', estado: '', cep: '', comissaoPercentual: '' })
        showAlert('success', 'Funcionário cadastrado com sucesso!')
        carregarFuncionarios()
      } else {
        const err = await r.json()
        showAlert('danger', err.message || 'Erro ao cadastrar funcionário.')
      }
    } catch {
      showAlert('danger', 'Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Remover o funcionário "${nome}"?`)) return
    try {
      const r = await fetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (r.ok) {
        carregarFuncionarios()
        showAlert('warning', 'Funcionário removido.')
      }
    } catch {
      showAlert('danger', 'Erro ao remover funcionário.')
    }
  }

  const funcionariosFiltrados = funcionarios.filter(f => {
    const s = removerMascara(searchTerm)
    return !s || removerMascara(f.nome || '').includes(s) || removerMascara(f.cpf || '').includes(s) ||
      removerMascara(f.telefone || '').includes(s) || removerMascara(f.email || '').includes(s)
  })

  const inputStyle = { backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#f5f5f5', padding: '0.8rem', borderRadius: '4px' }
  const labelStyle = { color: '#c9a227', fontWeight: '500', marginBottom: '0.5rem' }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>Gerenciamento de Funcionários</h2>
            <p style={{ color: '#a0a0a0' }}>{funcionarios.length} funcionário(s) ativo(s)</p>
          </Col>
        </Row>

        {alert.message && (
          <Alert variant={alert.type} style={{ backgroundColor: alert.type === 'success' ? '#1e3a1e' : alert.type === 'warning' ? '#3a2e00' : '#3a1e1e', border: 'none', color: '#f5f5f5' }}>
            {alert.message}
          </Alert>
        )}

        <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '8px' }}>
          <Card.Body style={{ padding: '2rem' }}>
            <Tabs defaultActiveKey="buscar" className="mb-4">
              <Tab eventKey="buscar" title={`Funcionários (${funcionarios.length})`}>
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Pesquisar por nome, CPF, telefone ou email</Form.Label>
                      <Form.Control type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={inputStyle} placeholder="Digite para filtrar..." />
                    </Form.Group>
                  </Col>
                </Row>
                <Table responsive style={{ color: '#f5f5f5' }}>
                  <thead style={{ backgroundColor: '#2d2d2d', color: '#c9a227' }}>
                    <tr>
                      <th>Nome</th><th>Email</th><th>Telefone</th><th>CPF</th><th>% Comissão</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionariosFiltrados.length > 0 ? funcionariosFiltrados.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #444' }}>
                        <td>{f.nome}</td>
                        <td>{f.email}</td>
                        <td>{f.telefone}</td>
                        <td>{f.cpf}</td>
                        <td>{f.comissaoPercentual != null ? <Badge bg="info">{f.comissaoPercentual}%</Badge> : <span style={{ color: '#888' }}>—</span>}</td>
                        <td><Badge bg="success">Ativo</Badge></td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(f.id, f.nome)}>Remover</Button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>
                        {searchTerm ? 'Nenhum funcionário encontrado para este filtro.' : 'Nenhum funcionário cadastrado ainda.'}
                      </td></tr>
                    )}
                  </tbody>
                </Table>
              </Tab>

              <Tab eventKey="cadastrar" title="Cadastrar Funcionário">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Nome Completo *</Form.Label>
                        <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} style={inputStyle} required placeholder="Nome completo" />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Email (login) *</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required placeholder="funcionario@barber.com" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Senha de Acesso *</Form.Label>
                        <Form.Control type="password" name="senha" value={formData.senha} onChange={handleChange} style={inputStyle} required placeholder="Senha para login do funcionário" />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Telefone *</Form.Label>
                        <Form.Control type="tel" name="telefone" value={formData.telefone} onChange={handleChange} style={inputStyle} required placeholder="(11) 99999-9999" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>CPF</Form.Label>
                        <Form.Control type="text" name="cpf" value={formData.cpf} onChange={handleChange} style={inputStyle} placeholder="000.000.000-00" />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Data de Nascimento</Form.Label>
                        <Form.Control type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} style={inputStyle} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Endereço</Form.Label>
                        <Form.Control type="text" name="endereco" value={formData.endereco} onChange={handleChange} style={inputStyle} placeholder="Rua, número" />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Cidade</Form.Label>
                        <Form.Control type="text" name="cidade" value={formData.cidade} onChange={handleChange} style={inputStyle} placeholder="São Paulo" />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Estado</Form.Label>
                        <Form.Control type="text" name="estado" value={formData.estado} onChange={handleChange} style={inputStyle} placeholder="SP" maxLength={2} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>% Comissão por serviço</Form.Label>
                        <Form.Control type="number" name="comissaoPercentual" min="0" max="100" step="0.5"
                          value={formData.comissaoPercentual} onChange={handleChange} style={inputStyle} placeholder="Ex: 30" />
                        <Form.Text style={{ color: '#888' }}>Deixe em branco para não calcular comissão</Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-center">
                    <Button type="submit" className="btn-gold" disabled={loading} style={{ padding: '0.8rem 3rem' }}>
                      {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
                    </Button>
                  </div>
                </Form>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default CadastroFuncionario
