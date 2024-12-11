export default function AdminHeader({ isCollapsed }) {
  console.log(isCollapsed);
  return (
    <header className={`admin-header ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo">Admin Dashboard</div>
      <div className="header-actions">
        <button className="notification-btn">🔔</button>
        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}
