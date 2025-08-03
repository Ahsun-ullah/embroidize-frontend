export default function AdminFooter({ isCollapsed }) {
  return (
    <footer className={`admin-footer ${isCollapsed ? 'collapsed' : ''}`}>
      <p>
        &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
      </p>
    </footer>
  );
}
