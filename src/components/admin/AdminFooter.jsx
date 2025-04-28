export default function AdminFooter({ isCollapsed }) {
  return (
    <footer className={`admin-footer ${isCollapsed ? 'collapsed' : ''}`}>
      <p>&copy; 2024 Admin Dashboard. All rights reserved.</p>
    </footer>
  );
}
