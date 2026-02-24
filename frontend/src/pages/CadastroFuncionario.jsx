import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Tab, Tabs } from 'react-bootstrap'

// Dados simulados de funcionários (em produção viria do backend)
const funcionariosIniciais = [
  { id: 1, nome: 'Marcos Souza', email: 'marcos@barber.com', telefone: '(11) 98888-1111', cpf: '111.222.333-44', cargo: 'barbeiro', especialidade: 'Cortes modernos', cidade: 'São Paulo' },
  { id: 2, nome: 'Ricardo Alves', email: 'ricardo@barber.com', telefone: '(11) 98888-2222', cpf: '555.666.777-88', cargo: 'barbeiro', especialidade: 'Barba modelada', cidade: 'São Paulo' },
  { id: 3, nome: 'Fernanda Lima', email: 'fernanda@barber.com', telefone: '(11) 98888-3333', cpf: '999.000.111-22', cargo: 'recepcionista', especialidade: 'Atendimento', cidade: 'Rio de Janeiro' },
]

// Função para remover caracteres especiais da string
const removerCaracteresEspeciais = (str) => {
  return str.replace(/[.\-() ]/g, '').toLowerCase()
}

function Funcionario() {
  const [funcionarios, setFuncionarios] = useState(funcionariosIniciais)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    cargo: '',
    dataAdmissao: '',
    salario: '',
    especialidade: '',
    cnh: '',
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
    const novoFuncionario = {
      id: Date.now(),
      ...formData
    }
    setFuncionarios(prev => [...prev, novoFuncionario])
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      cargo: '',
      dataAdmissao: '',
      salario: '',
      especialidade: '',
      cnh: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    })
    setAlert({ type: 'success', message: 'Funcionário cadastrado com sucesso!' })
    setTimeout(() => setAlert({ type: '', message: '' }), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      setFuncionarios(prev => prev.filter(f => f.id !== id))
      setAlert({ type: 'danger', message: 'Funcionário excluído com sucesso!' })
      setTimeout(() => setAlert({ type: '', message: '' }), 3000)
    }
  }

  // Filtrar funcionários pela busca (ignora máscara)
  const funcionariosFiltrados = funcionarios.filter(funcionario => {
    const search = removerCaracteresEspeciais(searchTerm)
    
    return (
      removerCaracteresEspeciais(funcionario.nome).includes(search) ||
      removerCaracteresEspeciais(funcionario.cpf).includes(search) ||
      removerCaracteresEspeciais(funcionario.telefone).includes(search) ||
      removerCaracteresEspeciais(funcionario.email).includes(search)
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
              Gerenciamento de Funcionário
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
              <Tab eventKey="cadastrar" title="Cadastrar">
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
                          placeholder="funcionario@barber.com"
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
                        <Form.Label style={labelStyle}>Cargo *</Form.Label>
                        <Form.Select
                          name="cargo"
                          value={formData.cargo}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                        >
                          <option value="">Selecione o cargo</option>
                          <option value="barbeiro">Barbeiro</option>
                          <option value="auxiliar">Auxiliar</option>
                          <option value="gerente">Gerente</option>
                          <option value="recepcionista">Recepcionista</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Data de Admissão *</Form.Label>
                        <Form.Control
                          type="date"
                          name="dataAdmissao"
                          value={formData.dataAdmissao}
                          onChange={handleChange}
                          style={inputStyle}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Salário</Form.Label>
                        <Form.Control
                          type="text"
                          name="salario"
                          value={formData.salario}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="R$ 0,00"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Especialidade</Form.Label>
                        <Form.Control
                          type="text"
                          name="especialidade"
                          value={formData.especialidade}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Cortes, Barba, etc."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>CNH</Form.Label>
                        <Form.Control
                          type="text"
                          name="cnh"
                          value={formData.cnh}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Número da CNH"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
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
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Endereço</Form.Label>
                        <Form.Control
                          type="text"
                          name="endereco"
                          value={formData.endereco}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Rua, número"
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

                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label style={labelStyle}>Observações</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="observacoes"
                          value={formData.observacoes}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="Informações adicionais..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <Button type="submit" className="btn-gold" style={{ padding: '0.8rem 3rem' }}>
                      Cadastrar
                    </Button>
                  </div>
                </Form>
              </Tab>

              <Tab eventKey="buscar" title="Buscar">
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
                      <th>Cargo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionariosFiltrados.length > 0 ? (
                      funcionariosFiltrados.map(funcionario => (
                        <tr key={funcionario.id} style={{ borderBottom: '1px solid #444' }}>
                          <td>{funcionario.nome}</td>
                          <td>{funcionario.email}</td>
                          <td>{funcionario.telefone}</td>
                          <td>{funcionario.cpf}</td>
                          <td style={{ textTransform: 'capitalize' }}>{funcionario.cargo}</td>
                          <td>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDelete(funcionario.id)}
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
                          Nenhum funcionário encontrado
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

export default Funcionario