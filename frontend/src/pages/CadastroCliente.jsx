import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'

function CadastroCliente() {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Dados do cliente:', formData)
    alert('Cliente cadastrado com sucesso!')
  }

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
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card style={{ 
              background: 'linear-gradient(145deg, #333333, #2a2a2a)', 
              border: '1px solid #c9a227',
              borderRadius: '8px'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <h2 style={{ 
                  color: '#c9a227', 
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Cadastro de Cliente
                </h2>
                
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
                          placeholder="Digite seu nome completo"
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
                          placeholder="seu@email.com"
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
                          placeholder="Alguma informação adicional..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <Button 
                      type="submit" 
                      className="btn-gold"
                      style={{ padding: '0.8rem 3rem' }}
                    >
                      Cadastrar Cliente
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CadastroCliente