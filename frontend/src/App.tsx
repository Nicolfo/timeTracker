import { useState, useEffect } from 'react'
import { Container, Navbar, Alert, Spinner } from 'react-bootstrap'
import { TimeTracker } from './components/TimeTracker'
import { UserAuth } from './components/UserAuth'
import { userApi } from './api'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userApi.getLoggedInUser()
        setUsername(user.username)
      } catch (error) {
        console.error('Failed to check authentication:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Time Tracker App</Navbar.Brand>
          <UserAuth />
        </Container>
      </Navbar>

      {username && username !== 'anonymous' ? (
        <TimeTracker />
      ) : (
        <Alert variant="danger" className="text-center mx-auto" style={{ maxWidth: '600px' }}>
          <Alert.Heading>Please log in to use the time tracker</Alert.Heading>
          <p>You need to be authenticated to track your time.</p>
        </Alert>
      )}
    </Container>
  )
}

export default App
