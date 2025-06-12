import { useState, useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { userApi } from '../api';

export function UserAuth() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the currently logged in user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await userApi.getLoggedInUser();
        setUsername(user.username);
      } catch (err) {
        setError('Failed to fetch user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle login
  const handleLogin = () => {
    window.location.href = '/oauth2/authorization/keycloak-client';
  };

  // Handle logout
  const handleLogout = () => {
    window.location.href = '/logout';
  };

  if (loading) {
    return <Spinner animation="border" size="sm" />;
  }

  return (
    <div className="d-flex align-items-center">
      {error && <Alert variant="danger" className="mb-0 me-2">{error}</Alert>}

      {username && username !== 'anonymous' ? (
        <div className="d-flex align-items-center">
          <span className="me-2">Logged in as: {username}</span>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <div className="d-flex align-items-center">
          <span className="me-2">Not logged in</span>
          <Button variant="outline-primary" size="sm" onClick={handleLogin}>Login</Button>
        </div>
      )}
    </div>
  );
}
