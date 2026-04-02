import { useState } from 'react';

const initialForm = { name: '', email: '', password: '' };

const AuthForm = ({ mode = 'login', onSubmit, loading, error, onToggleMode }) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="card auth-card">
      <h1>Customer Dashboard</h1>
      <p className="muted">{mode === 'login' ? 'Sign in to continue' : 'Create a customer account'}</p>

      <form onSubmit={handleSubmit} className="form-stack">
        {mode === 'register' ? (
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        ) : null}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <button className="btn ghost" onClick={onToggleMode} type="button">
        {mode === 'login' ? 'New user? Register' : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default AuthForm;
