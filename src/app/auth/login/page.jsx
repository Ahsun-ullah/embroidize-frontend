'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useLogInMutation } from '@/lib/redux/public/auth/authSlice';
import { Card, CardBody, CardHeader, Input } from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const [logIn, { isLoading }] = useLogInMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract form data
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await logIn(data);
      console.log('API Response:', response);
      if (response.error) {
        ErrorToast('Error', response.error.data.message || 'API Error', 3000);
      } else {
        SuccessToast(
          'Success',
          response.data.message || 'Registration successful!',
          3000,
        );
        if (
          response?.data?.data?.token &&
          response?.data?.data?.role === 'admin'
        ) {
          Cookies.set('token', response?.data?.data?.token);
          router.push('/admin');
        } else {
          Cookies.set('token', response?.data?.data?.token);
          router.push('/');
        }
        // e.target.reset();
      }
    } catch (err) {
      ErrorToast(
        'Error',
        err.message || 'Something went wrong. Please try again.',
        3000,
      );
    }
  };

  return (
    <>
      <div className='flex flex-col h-screen items-center justify-center gap-10 px-4 sm:px-6 lg:px-8'>
        <Card className='w-full max-w-md p-6 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3'>
          <CardHeader className='flex flex-col items-start'>
            <h4 className='font-bold text-xl mb-3'>
              Welcome To{' '}
              <Link href='/' className='font-bold ml-1 text-blue-500 '>
                Embroid
              </Link>
              !
            </h4>
            <p className='text-sm uppercase font-bold'>
              Sign in to continue to EmbroiD.
            </p>
          </CardHeader>
          <CardBody className='overflow-visible py-2'>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <Input
                  type='email'
                  name='email'
                  className='form-control mt-2'
                  placeholder='Enter your email'
                  required
                />
              </div>
              <div className='mb-6'>
                <label className='form-label' htmlFor='password-input'>
                  Password
                </label>
                <Input
                  type='password'
                  name='password'
                  className='form-control password-input mt-2'
                  placeholder='Enter password'
                  required
                />
              </div>

              <div className='w-full flex items-center justify-center'>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <input
                    type='submit'
                    value='Login'
                    className='button hover:bg-blue-500 text-white hover:text-white w-full h-10 rounded-md'
                  />
                )}
              </div>
            </form>
            <div className='mt-5 text-center'>
              <p className='mb-0'>
                Don't have an account?
                <Link
                  href='/auth/register'
                  className='font-semibold ml-1 text-blue-500 underline'
                >
                  Register
                </Link>
              </p>
            </div>
          </CardBody>
          {/* <CardFooter className="flex justify-center">
            <button
              className="button flex items-center justify-center mx-auto hover:text-black font-bold"
              type="button"
              onClick={() => signIn('google')}
            >
              <i className="ri-google-fill me-2 text-3xl"></i> Sign In With
              Google
            </button>
          </CardFooter> */}
        </Card>
        <div className='text-center'>
          <p className='mb-0'>
            &copy; {new Date().getFullYear()} EmbroID. Crafted by Ahsun
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
