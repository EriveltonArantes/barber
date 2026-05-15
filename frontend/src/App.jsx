import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Cliente from './pages/Cliente'
import CadastroFuncionario from './pages/CadastroFuncionario'
import Login from './pages/Login'
import Agendamento from './pages/Agendamento'
import MeusAgendamentos from './pages/MeusAgendamentos'
import Dashboard from './pages/Dashboard'
import Servicos from './pages/Servicos'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/meus-agendamentos" element={<ProtectedRoute><MeusAgendamentos /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute><Cliente /></ProtectedRoute>} />
          <Route path="/cadastro-funcionario" element={<ProtectedRoute><CadastroFuncionario /></ProtectedRoute>} />
          <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
