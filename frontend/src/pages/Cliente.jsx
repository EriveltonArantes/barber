import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Tab, Tabs } from 'react-bootstrap'

const removerMascara = (str) => str.replace(/[.\-() ]/g, '').toLowerCase()
const token = () => localStorage.getItem('barber_token')
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

function Cliente() {
  const [clientes, setClientes] = useState([])
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', telefone: '', cpf: '', dataNascimento: '', endereco: '', cidade: '', estado: '', cep: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const carregarClientes = async () => {
    try {
      const r = await fetch('/api/usuarios/role/CLIENTE', { headers: authHeaders() })
      if (r.ok) setClientes(await r.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { carregarClientes() }, [])

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
        body: JSON.stringify({ ...formData, role: 'CLIENTE' })
      })
      if (r.ok) {
        setFormData({ nome: '', email: '', senha: '', telefone: '', cpf: '', dataNascimento: '', endereco: '', cidade: '', estado: '', cep: '' })
        showAlert('success', 'Cliente cadastrado com sucesso!')
        carregarClientes()
      } else {
        const err = await r.json()
        showAlert('danger', err.message || 'Erro ao cadastrar cliente.')
      }
    } catch {
      showAlert('danger', 'Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Excluir o cliente "${nome}"?`)) return
    try {
      const r = await fetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (r.ok) {
        carregarClientes()
        showAlert('warning', 'Cliente excluído.')
      }
    } catch {
      showAlert('danger', 'Erro ao excluir cliente.')
    }
  }

  const clientesFiltrados = clientes.filter(c => {
    const s = removerMascara(searchTerm)
    return !s || removerMascara(c.nome || '').includes(s) || removerMascara(c.cpf || '').includes(s) ||
      removerMascara(c.telefone || '').includes(s) || removerMascara(c.email || '').includes(s)
  })

  const inputStyle = { backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#f5f5f5', padding: '0.8rem', borderRadius: '4px' }
  const labelStyle = { color: '#c9a227', fontWeight: '500', marginBottom: '0.5rem' }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>Gerenciamento de Clientes</h2>
            <p style={{ color: '#a0a0a0' }}>{clientes.length} cliente(s) cadastrado(s)</p>
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
              <Tab eventKey="buscar" title={`Clientes (${clientes.length})`}>
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
                      <th>Nome</th><th>Email</th><th>Telefone</th><th>CPF</th><th>Cidade</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.length > 0 ? clientesFiltrados.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #444' }}>
                        <td>{c.nome}</td>
                        <td>{c.email}</td>
                        <td>{c.telefone}</td>
                        <td>{c.cpf}</td>
                        <td>{c.cidade}</td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.id, c.nome)}>Excluir</Button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>
                        {searchTerm ? 'Nenhum cliente encontrado para este filtro.' : 'Nenhum cliente cadastrado ainda.'}
                      </td></tr>
                    )}
                  </tbody>
                </Table>
              </Tab>

              <Tab eventKey="cadastrar" title="Cadastrar Cliente">
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
                        <Form.Label style={labelStyle}>Email *</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required placeholder="cliente@email.com" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Senha de Acesso *</Form.Label>
                        <Form.Control type="password" name="senha" value={formData.senha} onChange={handleChange} style={inputStyle} required placeholder="Senha para o cliente fazer login" />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Telefone</Form.Label>
                        <Form.Control type="tel" name="telefone" value={formData.telefone} onChange={handleChange} style={inputStyle} placeholder="(11) 99999-9999" />
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
                  <div className="text-center">
                    <Button type="submit" className="btn-gold" disabled={loading} style={{ padding: '0.8rem 3rem' }}>
                      {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
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

export default Cliente
