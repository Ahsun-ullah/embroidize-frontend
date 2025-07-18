import UserDetailsComponent from '@/components/user/userDetails/UserDetailsComponent';

export default function UserDetailsPage({ searchParams }) {
  const defaultTab = searchParams?.tabName;

  return (
    <section className='container'>
      <UserDetailsComponent defaultTab={defaultTab} />
    </section>
  );
}


