import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge } from 'react-bootstrap'

const token = () => localStorage.getItem('barber_token')
const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' })

function Servicos() {
  const [servicos, setServicos] = useState([])
  const [formData, setFormData] = useState({ nome: '', duracao: '', preco: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const carregarServicos = async () => {
    try {
      const r = await fetch('/api/servicos', { headers: authHeaders() })
      if (r.ok) setServicos(await r.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { carregarServicos() }, [])

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert({ type: '', message: '' }), 3500)
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        ...(editando ? { id: editando.id } : {}),
        nome: formData.nome,
        duracao: parseInt(formData.duracao),
        preco: parseFloat(formData.preco),
        ativo: true
      }
      const r = await fetch('/api/servicos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      })
      if (r.ok) {
        setFormData({ nome: '', duracao: '', preco: '' })
        setEditando(null)
        showAlert('success', editando ? 'Serviço atualizado!' : 'Serviço cadastrado!')
        carregarServicos()
      } else {
        const err = await r.json()
        showAlert('danger', err.message || 'Erro ao salvar serviço.')
      }
    } catch {
      showAlert('danger', 'Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (s) => {
    setEditando(s)
    setFormData({ nome: s.nome, duracao: String(s.duracao), preco: String(s.preco) })
  }

  const handleCancelarEdicao = () => {
    setEditando(null)
    setFormData({ nome: '', duracao: '', preco: '' })
  }

  const handleToggleAtivo = async (s) => {
    try {
      await fetch('/api/servicos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id: s.id, nome: s.nome, duracao: s.duracao, preco: s.preco, ativo: !s.ativo })
      })
      carregarServicos()
    } catch { /* ignore */ }
  }

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Excluir o serviço "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      const r = await fetch(`/api/servicos/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (r.ok) {
        carregarServicos()
        showAlert('warning', 'Serviço excluído.')
      }
    } catch {
      showAlert('danger', 'Erro ao excluir serviço.')
    }
  }

  const inputStyle = { backgroundColor: '#2d2d2d', border: '1px solid #444', color: '#f5f5f5', padding: '0.8rem', borderRadius: '4px' }
  const labelStyle = { color: '#c9a227', fontWeight: '500', marginBottom: '0.5rem' }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a', paddingBottom: '50px' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>Gestão de Serviços</h2>
            <p style={{ color: '#a0a0a0' }}>{servicos.filter(s => s.ativo).length} serviço(s) ativo(s)</p>
          </Col>
        </Row>

        {alert.message && (
          <Alert variant={alert.type} style={{ backgroundColor: alert.type === 'success' ? '#1e3a1e' : alert.type === 'warning' ? '#3a2e00' : '#3a1e1e', border: 'none', color: '#f5f5f5' }}>
            {alert.message}
          </Alert>
        )}

        <Row>
          {/* Formulário */}
          <Col lg={4} className="mb-4">
            <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: `1px solid ${editando ? '#17a2b8' : '#c9a227'}`, borderRadius: '8px' }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>
                  {editando ? `Editando: ${editando.nome}` : 'Novo Serviço'}
                </h5>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyle}>Nome do Serviço *</Form.Label>
                    <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} style={inputStyle} required placeholder="Ex: Corte Masculino" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={labelStyle}>Duração (minutos) *</Form.Label>
                    <Form.Control type="number" name="duracao" value={formData.duracao} onChange={handleChange} style={inputStyle} required placeholder="Ex: 30" min="5" max="300" />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={labelStyle}>Preço (R$) *</Form.Label>
                    <Form.Control type="number" name="preco" value={formData.preco} onChange={handleChange} style={inputStyle} required placeholder="Ex: 50.00" min="0" step="0.01" />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button type="submit" className="btn-gold" disabled={loading}>
                      {loading ? 'Salvando...' : editando ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
                    </Button>
                    {editando && (
                      <Button variant="outline-secondary" onClick={handleCancelarEdicao}>Cancelar Edição</Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Tabela de serviços */}
          <Col lg={8}>
            <Card style={{ background: 'linear-gradient(145deg, #333333, #2a2a2a)', border: '1px solid #c9a227', borderRadius: '8px' }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h5 style={{ color: '#c9a227', marginBottom: '1.5rem' }}>Serviços Cadastrados</h5>
                <Table responsive style={{ color: '#f5f5f5' }}>
                  <thead style={{ backgroundColor: '#2d2d2d', color: '#c9a227' }}>
                    <tr>
                      <th>Nome</th><th>Duração</th><th>Preço</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicos.length > 0 ? servicos.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #444', opacity: s.ativo ? 1 : 0.5 }}>
                        <td style={{ fontWeight: '500' }}>{s.nome}</td>
                        <td>{s.duracao} min</td>
                        <td style={{ color: '#28a745', fontWeight: 'bold' }}>R$ {s.preco?.toFixed(2)}</td>
                        <td>
                          <Badge bg={s.ativo ? 'success' : 'secondary'} style={{ cursor: 'pointer' }} onClick={() => handleToggleAtivo(s)}>
                            {s.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-warning" size="sm" onClick={() => handleEditar(s)}>Editar</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id, s.nome)}>Excluir</Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem' }}>Nenhum serviço cadastrado.</td></tr>
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

export default Servicos
