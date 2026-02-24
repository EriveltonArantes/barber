import { Container, Row, Col, Button } from 'react-bootstrap'

function Home() {
  return (
    <div id="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Bem-vindo ao
            <span>BARBER PREMIUM</span>
          </h1>
          <p className="hero-subtitle">
            Onde estilo encontra excelência. Experimente o melhor em cuidados masculinos.
          </p>
          <Button className="btn-gold" href="/agendamento">
            Agendar Horário
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="features-section">
        <Container>
          <Row className="mb-5">
            <Col lg={12} className="text-center">
              <h2 style={{ color: '#c9a227', fontSize: '2.5rem', marginBottom: '1rem' }}>Nossos Serviços</h2>
              <p style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
                Qualidade premium para você ficar sempre no seu melhor
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">✂️</div>
                <h3 className="feature-title">Corte Masculino</h3>
                <p className="feature-text">
                  Cortes modernos e clássicos, personalizados para seu estilo e tipo de cabelo.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">🪒</div>
                <h3 className="feature-title">Barba Modelada</h3>
                <p className="feature-text">
                  Modelagem profissional de barba com navalha e produtos premium.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">💆</div>
                <h3 className="feature-title">Tratamentos</h3>
                <p className="feature-text">
                  Hidratação, massagem relaxante e tratamentos capilares especializados.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '5rem 0', backgroundColor: '#1a1a1a' }}>
        <Container>
          <Row align="center">
            <Col lg={6} className="mb-4">
              <h2 style={{ color: '#c9a227', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                Tradição e Modernidade
              </h2>
              <p style={{ color: '#a0a0a0', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Com mais de 10 anos de experiência, o Barber Premium traz o que há de melhor 
                em cuidados masculinos. Nossa equipe é especializada nas mais modernas técnicas 
                de cortes e barbear, sempre utilizando produtos de primeira linha.
              </p>
              <p style={{ color: '#a0a0a0', fontSize: '1.1rem', lineHeight: '1.8' }}>
                Aqui, cada cliente é único. Nosso objetivo é proporcionar uma experiência 
                relaxante e transformadora, onde você sai não apenas bem aparado, mas também renovado.
              </p>
            </Col>
            <Col lg={6}>
              <div style={{
                background: 'linear-gradient(145deg, #333333, #2a2a2a)',
                padding: '3rem',
                border: '1px solid #c9a227',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#f5f5f5', fontSize: '2rem', marginBottom: '1rem' }}>Horário de Funcionamento</h3>
                <p style={{ color: '#a0a0a0', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#c9a227' }}>Segunda a Sexta:</strong> 09:00 - 21:00
                </p>
                <p style={{ color: '#a0a0a0', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#c9a227' }}>Sábado:</strong> 09:00 - 18:00
                </p>
                <p style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
                  <strong style={{ color: '#c9a227' }}>Domingo:</strong> Fechado
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '5rem 0', backgroundColor: '#2d2d2d' }}>
        <Container>
          <Row className="text-center mb-5">
            <Col lg={12}>
              <h2 style={{ color: '#c9a227', fontSize: '2.5rem', marginBottom: '1rem' }}>Fale Conosco</h2>
              <p style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
                Estamos prontos para atender você
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4 text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📍</div>
              <h4 style={{ color: '#f5f5f5', marginBottom: '0.5rem' }}>Endereço</h4>
              <p style={{ color: '#a0a0a0' }}>Av. Principal, 123<br />Centro - São Paulo, SP</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📞</div>
              <h4 style={{ color: '#f5f5f5', marginBottom: '0.5rem' }}>Telefone</h4>
              <p style={{ color: '#a0a0a0' }}>(11) 99999-9999</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h4 style={{ color: '#f5f5f5', marginBottom: '0.5rem' }}>Email</h4>
              <p style={{ color: '#a0a0a0' }}>contato@barberpremium.com.br</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <p className="footer-text">
            © 2024 <span>Barber Premium</span>. Todos os direitos reservados.
          </p>
        </Container>
      </footer>
    </div>
  )
}

export default Home