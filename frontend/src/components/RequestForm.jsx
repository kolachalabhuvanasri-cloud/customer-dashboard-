import { useState } from 'react';

const RequestForm = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="card">
      <h2>Submit a Request</h2>
      <form onSubmit={handleSubmit} className="form-stack">
        <input
          placeholder="Issue title (e.g. Billing mismatch for invoice #1124)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={4}
          required
        />
        <textarea
          placeholder="Describe the issue with enough detail for support and developers."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          minLength={10}
          required
        />
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
