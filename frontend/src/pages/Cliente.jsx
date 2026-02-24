import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Tab, Tabs } from 'react-bootstrap'

// Dados simulados de clientes (em produção viria do backend)
const clientesIniciais = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111', cpf: '123.456.789-00', dataNascimento: '1990-05-15', endereco: 'Rua A, 123', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' },
  { id: 2, nome: 'Pedro Santos', email: 'pedro@email.com', telefone: '(11) 99999-2222', cpf: '987.654.321-00', dataNascimento: '1985-08-20', endereco: 'Rua B, 456', cidade: 'São Paulo', estado: 'SP', cep: '04567-890' },
  { id: 3, nome: 'Carlos Oliveira', email: 'carlos@email.com', telefone: '(11) 99999-3333', cpf: '456.789.123-00', dataNascimento: '1992-03-10', endereco: 'Rua C, 789', cidade: 'Rio de Janeiro', estado: 'RJ', cep: '20000-000' },
]

// Função para remover caracteres especiais da string
const removerCaracteresEspeciais = (str) => {
  return str.replace(/[.\-() ]/g, '').toLowerCase()
}

function Cliente() {
  const [clientes, setClientes] = useState(clientesIniciais)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [alert, setAlert] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const novoCliente = {
      id: Date.now(),
      ...formData
    }
    setClientes(prev => [...prev, novoCliente])
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    })
    setAlert({ type: 'success', message: 'Cliente cadastrado com sucesso!' })
    setTimeout(() => setAlert({ type: '', message: '' }), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(prev => prev.filter(c => c.id !== id))
      setAlert({ type: 'danger', message: 'Cliente excluído com sucesso!' })
      setTimeout(() => setAlert({ type: '', message: '' }), 3000)
    }
  }

  // Filtrar clientes pela busca (ignora máscara)
  const clientesFiltrados = clientes.filter(cliente => {
    const search = removerCaracteresEspeciais(searchTerm)
    
    return (
      removerCaracteresEspeciais(cliente.nome).includes(search) ||
      removerCaracteresEspeciais(cliente.cpf).includes(search) ||
      removerCaracteresEspeciais(cliente.telefone).includes(search) ||
      removerCaracteresEspeciais(cliente.email).includes(search)
    )
  })

  const inputStyle = {
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    color: '#f5f5f5',
    padding: '0.8rem',
    borderRadius: '4px'
  }

  const labelStyle = {
    color: '#c9a227',
    fontWeight: '500',
    marginBottom: '0.5rem'
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#c9a227', fontFamily: "'Playfair Display', serif" }}>
              Gerenciamento de Clientes
            </h2>
          </Col>
        </Row>

        {alert.message && (
          <Alert variant={alert.type} style={{ backgroundColor: alert.type === 'success' ? '#1e3a1e' : '#3a1e1e', border: 'none', color: '#f5f5f5' }}>
            {alert.message}
          </Alert>
        )}

        <Card style={{ 
          background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
          border: '1px solid #c9a227',
          borderRadius: '8px'
        }}>
          <Card.Body style={{ padding: '2rem' }}>
            <Tabs defaultActiveKey="cadastrar" className="mb-4" style={{ color: '#c9a227' }}>
              <Tab eventKey="cadastrar" title="Cadastrar Cliente">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Nome Completo *</Form.Label>
                        <Form.Control
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                          placeholder="Digite o nome completo"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                          placeholder="cliente@email.com"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Telefone *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                          placeholder="(11) 99999-9999"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>CPF *</Form.Label>
                        <Form.Control
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                          placeholder="000.000.000-00"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Data de Nascimento</Form.Label>
                        <Form.Control
                          type="date"
                          name="dataNascimento"
                          value={formData.dataNascimento}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>CEP</Form.Label>
                        <Form.Control
                          type="text"
                          name="cep"
                          value={formData.cep}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="00000-000"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Endereço</Form.Label>
                        <Form.Control
                          type="text"
                          name="endereco"
                          value={formData.endereco}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Rua, número, complemento"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Cidade</Form.Label>
                        <Form.Control
                          type="text"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="São Paulo"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Estado</Form.Label>
                        <Form.Control
                          type="text"
                          name="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="SP"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <Button type="submit" className="btn-gold" style={{ padding: '0.8rem 3rem' }}>
                      Cadastrar Cliente
                    </Button>
                  </div>
                </Form>
              </Tab>

              <Tab eventKey="buscar" title="Buscar Cliente">
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>Pesquisar por: Nome, CPF, Telefone ou Email</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={inputStyle}
                        placeholder="Digite para buscar (com ou sem máscara)..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Table responsive style={{ color: '#f5f5f5' }}>
                  <thead style={{ backgroundColor: '#2d2d2d', color: '#c9a227' }}>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>CPF</th>
                      <th>Cidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map(cliente => (
                        <tr key={cliente.id} style={{ borderBottom: '1px solid #444' }}>
                          <td>{cliente.nome}</td>
                          <td>{cliente.email}</td>
                          <td>{cliente.telefone}</td>
                          <td>{cliente.cpf}</td>
                          <td>{cliente.cidade}</td>
                          <td>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(cliente.id)}
                              style={{ backgroundColor: '#dc3545', border: 'none' }}
                            >
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center" style={{ color: '#a0a0a0', padding: '2rem' }}>
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Cliente