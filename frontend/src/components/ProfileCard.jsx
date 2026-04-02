const ProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="card">
      <h2>Profile</h2>
      <div className="profile-grid">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Total Requests:</strong> {user._count?.requests ?? 0}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
