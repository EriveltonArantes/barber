import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext(null)
const API_URL = '/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshingRef = useRef(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('barber_user')
    const token = localStorage.getItem('barber_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const saveSession = (data) => {
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
    if (data.refreshToken) {
      localStorage.setItem('barber_refresh_token', data.refreshToken)
    }
  }

  const tryRefresh = async () => {
    if (refreshingRef.current) return null
    const rt = localStorage.getItem('barber_refresh_token')
    if (!rt) return null

    refreshingRef.current = true
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      })
      if (!res.ok) {
        doLogout()
        return null
      }
      const data = await res.json()
      saveSession(data)
      return data.token
    } catch {
      doLogout()
      return null
    } finally {
      refreshingRef.current = false
    }
  }

  // helper fetch com renovação automática de token
  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('barber_token')
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`

    let res = await fetch(url, { ...options, headers })

    if (res.status === 401) {
      const newToken = await tryRefresh()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        res = await fetch(url, { ...options, headers })
      }
    }

    return res
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      })

      if (response.status === 429) {
        return { success: false, message: 'Muitas tentativas. Aguarde 1 minuto.' }
      }

      if (!response.ok) {
        const error = await response.json()
        return { success: false, message: error.message || 'Credenciais inválidas' }
      }

      const data = await response.json()
      saveSession(data)
      return { success: true, role: data.role }
    } catch {
      return { success: false, message: 'Erro ao conectar com o servidor' }
    }
  }

  const registrarCliente = async (dados) => {
    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      saveSession(data)
      return { success: true }
    } catch {
      return { success: false, message: 'Erro ao conectar com o servidor' }
    }
  }

  const doLogout = () => {
    setUser(null)
    localStorage.removeItem('barber_user')
    localStorage.removeItem('barber_token')
    localStorage.removeItem('barber_refresh_token')
  }

  const logout = async () => {
    const rt = localStorage.getItem('barber_refresh_token')
    if (rt) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt })
        })
      } catch { /* silencia */ }
    }
    doLogout()
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isFuncionario = () => user?.role === 'FUNCIONARIO'
  const isCliente = () => user?.role === 'CLIENTE'

  const fetchFuncionarios = async () => {
    try {
      const res = await apiFetch(`${API_URL}/usuarios/role/FUNCIONARIO`)
      if (res.ok) setFuncionarios(await res.json())
    } catch { /* ignore */ }
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
      apiFetch,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
