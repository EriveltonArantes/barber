import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_URL = '/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('barber_user')
    const token = localStorage.getItem('barber_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, message: error.message || 'Credenciais inválidas' }
      }

      const data = await response.json()
      const userData = {
        email: data.email,
        nome: data.nome,
        role: data.role,
        id: data.id,
        telefone: data.telefone,
        token: data.token
      }
      
      setUser(userData)
      localStorage.setItem('barber_user', JSON.stringify(userData))
      localStorage.setItem('barber_token', data.token)
      
      return { success: true, role: data.role }
    } catch (error) {
      return { success: false, message: 'Erro ao conectar com o servidor' }
    }
  }

  const registrarCliente = async (dados) => {
    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: dados.email,
          senha: dados.senha,
          nome: dados.nome,
          role: 'CLIENTE',
          telefone: dados.telefone || '',
          cpf: dados.cpf || '',
          dataNascimento: dados.dataNascimento || '',
          endereco: dados.endereco || '',
          cidade: dados.cidade || '',
          estado: dados.estado || '',
          cep: dados.cep || ''
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, message: error.message || 'Erro ao cadastrar' }
      }

      const data = await response.json()
      const userData = {
        email: data.email,
        nome: data.nome,
        role: data.role,
        id: data.id,
        telefone: data.telefone,
        token: data.token
      }
      
      setUser(userData)
      localStorage.setItem('barber_user', JSON.stringify(userData))
      localStorage.setItem('barber_token', data.token)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Erro ao conectar com o servidor' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('barber_user')
    localStorage.removeItem('barber_token')
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  const isFuncionario = () => {
    return user?.role === 'FUNCIONARIO'
  }

  const isCliente = () => {
    return user?.role === 'CLIENTE'
  }

  const fetchFuncionarios = async () => {
    try {
      const token = localStorage.getItem('barber_token')
      const response = await fetch(`${API_URL}/usuarios/role/FUNCIONARIO`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFuncionarios(data)
      }
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      registrarCliente, 
      logout, 
      isAdmin, 
      isFuncionario, 
      isCliente, 
      funcionarios,
      fetchFuncionarios,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}