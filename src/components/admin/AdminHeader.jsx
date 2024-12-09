export default function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="logo">Admin Dashboard</div>
      <div className="header-actions">
        <button className="notification-btn">🔔</button>
        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}
