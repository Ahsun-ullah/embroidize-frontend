import AdminFooter from '../../components/admin/AdminFooter';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-main">
        <AdminSidebar />
        <main className="admin-content">{children}</main>
      </div>
      <AdminFooter />
    </div>
  );
}
