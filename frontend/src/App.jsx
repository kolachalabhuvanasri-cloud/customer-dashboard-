import { useState } from 'react';
import AuthForm from './components/AuthForm';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';

const App = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
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
          onToggleMode={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
        />
      </main>
    );
  }

  return <DashboardPage />;
};

export default App;
