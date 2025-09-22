import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useSocketStore } from './store/socketStore'
import { useEffect } from 'react'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

// Components
import LoadingSpinner from './components/common/LoadingSpinner'
import CallModal from './components/call/CallModal'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && !isLoading) {
      connect(user)
    } else {
      disconnect()
    }

    return () => disconnect()
  }, [user, isLoading, connect, disconnect])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/chat" />} 
        />
        <Route 
          path="/chat" 
          element={user ? <Chat /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/chat" : "/login"} />} 
        />
      </Routes>
      
      {/* Call Modal - Always rendered but conditionally visible */}
      <CallModal />
    </div>
  )
}

export default App