import UserDetailsComponent from '@/components/user/userDetails/UserDetailsComponent';

export default function UserDetailsPage({ searchParams }) {
  const defaultTab = searchParams?.tabName;

  console.log(defaultTab);
  return (
    <section className='container'>
      <UserDetailsComponent defaultTab={defaultTab} />
    </section>
  );
}
