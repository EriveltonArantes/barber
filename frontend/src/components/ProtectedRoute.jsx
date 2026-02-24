import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAdmin, isFuncionario, user } = useAuth()
  
  // Permite admin ou funcionário logado
  if (!isAdmin() && !isFuncionario()) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute