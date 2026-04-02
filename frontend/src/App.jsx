import { useEffect, useState } from 'react';
import { ApiError, checkApiHealth } from './api/client';
import AuthForm from './components/AuthForm';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';

const getUserFriendlyAuthError = (error, mode) => {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK_ERROR') {
      return error.message;
    }

    if (error.status === 409) {
      return 'This email is already registered. Try logging in instead.';
    }

    if (error.status === 401) {
      return mode === 'login' ? 'Invalid email or password.' : 'Unable to authenticate this account.';
    }

    if (error.code === 'BAD_RESPONSE') {
      return 'Received an unexpected server response. Please try again.';
    }
  }

  return error?.message || 'Something went wrong. Please try again.';
};

const App = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectivityMessage, setConnectivityMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) return;

    checkApiHealth()
      .then(() => setConnectivityMessage(''))
      .catch((err) => {
        setConnectivityMessage(err.message || 'Unable to verify API connectivity.');
      });
  }, [isAuthenticated]);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');

    try {
      await checkApiHealth();
      setConnectivityMessage('');

      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      const message = getUserFriendlyAuthError(err, mode);
      setError(message);
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        setConnectivityMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="container center-screen">
        <AuthForm
          mode={mode}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          connectivityMessage={connectivityMessage}
          onToggleMode={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
        />
      </main>
    );
  }

  return <DashboardPage />;
};

export default App;
