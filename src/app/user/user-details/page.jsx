import UserDetailsComponent from '@/components/user/userDetails/UserDetailsComponent';

export default function UserDetailsPage({ searchParams }) {
  const defaultTab = searchParams?.tabName;
  // Set when a product page redirects here because the user already owns that
  // design in that format — pre-filtering the history so the row is on screen
  // rather than buried in a paginated list.
  const defaultSearch = searchParams?.search;
  const defaultFileType = searchParams?.fileType;

  return (
    <section className='container'>
      <UserDetailsComponent
        defaultTab={defaultTab}
        defaultSearch={defaultSearch}
        defaultFileType={defaultFileType}
      />
    </section>
  );
}
