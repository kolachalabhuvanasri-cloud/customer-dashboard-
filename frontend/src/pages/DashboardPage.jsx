import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import RequestForm from '../components/RequestForm';
import RequestList from '../components/RequestList';

const DashboardPage = () => {
  const { token, user, logout, refreshProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setRequestsError('');
      const data = await apiRequest('/requests', { token });
      setRequests(data.requests);
    } catch (error) {
      setRequestsError(error.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    refreshProfile().catch(() => null);
  }, []);

  const handleCreateRequest = async (payload) => {
    try {
      setSubmitLoading(true);
      await apiRequest('/request', { method: 'POST', token, body: payload });
      await fetchRequests();
      await refreshProfile();
    } catch (error) {
      setRequestsError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p className="muted">Track your requests in real-time as developers update statuses.</p>
        </div>
        <button className="btn ghost" onClick={logout} type="button">
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <div className="stack-gap">
          <RequestForm onSubmit={handleCreateRequest} loading={submitLoading} />
          <RequestList requests={requests} loading={loadingRequests} error={requestsError} />
        </div>
        <ProfileCard user={user} />
      </section>
    </main>
  );
};

export default DashboardPage;
