const statusClass = {
  PENDING: 'tag pending',
  IN_PROGRESS: 'tag progress',
  COMPLETED: 'tag completed'
};

const RequestList = ({ requests, loading, error }) => {
  return (
    <div className="card">
      <h2>Your Requests</h2>
      {loading ? <p className="muted">Loading requests...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && requests.length === 0 ? <p className="muted">No requests yet.</p> : null}
      <div className="request-list">
        {requests.map((request) => (
          <article key={request.id} className="request-item">
            <div className="request-head">
              <h3>{request.title}</h3>
              <span className={statusClass[request.status] || 'tag'}>{request.status.replace('_', ' ')}</span>
            </div>
            <p>{request.description}</p>
            <small className="muted">Created at: {new Date(request.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RequestList;
