'use client';

export default function AdminChoiceStar({ status }) {
  // If status is false or undefined, don't render anything
  if (!status) return null;

  return (
    <div className='flex items-center justify-center' title='Admin Choice'>
      <i className='ri-shield-star-fill text-4xl text-primary'></i>
    </div>
  );
}
