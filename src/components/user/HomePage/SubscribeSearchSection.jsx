import { Input } from '@heroui/react';

const SubscribeSearchSection = () => {
  return (
    <>
      <section className='bg-blue-50 text-black py-10 my-16'>
        <h1 className='text-center text-xl font-bold mb-4'>
          Feel Free To Ask Questions
        </h1>
        <div className='flex justify-center'>
          <div className='w-full max-w-[25rem] sm:max-w-[20rem] md:max-w-[25rem] lg:max-w-[30rem]'>
            <Input
              variant={'bordered'}
              radius='full'
              isBordered
              classNames={{
                base: 'h-10',
                mainWrapper: 'h-full',
                input: 'text-small',
                inputWrapper: 'h-full font-normal text-black bg-white',
              }}
              placeholder='Type to search...'
              size='sm'
              endContent={
                <button className='px-2 py-1 rounded-full bg-black font-semibold hover:bg-blue-400 text-white text-sm'>
                  Subscribe
                </button>
              }
              type='search'
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default SubscribeSearchSection;
