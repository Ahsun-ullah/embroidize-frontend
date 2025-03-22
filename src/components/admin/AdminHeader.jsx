import ProfileDropdown from '../Common/ProfileDropdown';

export default function AdminHeader({ isCollapsed }) {
  return (
    <header className={`admin-header ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo">Admin Dashboard</div>
      <div className="header-actions">
        <ProfileDropdown />
      </div>
    </header>
  );
}
