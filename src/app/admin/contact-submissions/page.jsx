import { ContactSubmissionsTable } from '@/components/admin/ContactSubmissionsTable';
import { columns } from './columns';

const ContactSubmissionsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Form Submissions</h1>
      <ContactSubmissionsTable columns={columns} />
    </div>
  );
};

export default ContactSubmissionsPage;
