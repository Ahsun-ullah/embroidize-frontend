'use client';
import { ErrorToast } from '@/components/Common/ErrorToast';
import PurchaseButton from '@/components/Common/PurchaseButton';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { Divider } from '@heroui/divider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pathName = usePathname();
  const router = useRouter();

  const { data: userInfoData } = useUserInfoQuery();

  console.log(userInfoData);

  // ✅ Get the user's active plan ID safely (null if not logged in / no subscription)
  const activePlanId = userInfoData?.subscription?.planId ?? null;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');

    if (status === 'success') {
      SuccessToast('Success', 'Payment completed successfully!', 10000);
      router.push('/subscriptions');
    } else if (status === 'cancelled') {
      ErrorToast('Cancelled', 'Payment was cancelled.', 10000);
    }
  }, [pathName]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/subscriptions`,
        );
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data.data.plans ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <div className='min-h-screen flex items-center justify-center bg-white'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin' />
            <p className='text-gray-500 text-sm'>Loading plans...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className='min-h-screen flex items-center justify-center bg-white'>
          <div className='text-center'>
            <p className='text-red-500 font-semibold text-lg'>
              Something went wrong
            </p>
            <p className='text-gray-400 text-sm mt-1'>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className='min-h-screen bg-white py-16 px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Page heading */}
          <div className='text-center mb-14'>
            <h1 className='text-4xl md:text-5xl font-extrabold text-black tracking-tight'>
              Subscription Plans
            </h1>
            <p className='mt-3 text-gray-500 text-base max-w-xl mx-auto'>
              Choose a plan that fits your stitching workflow. Upgrade or cancel
              anytime.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className='text-center py-24 border border-gray-200 rounded-xl'>
              <p className='text-gray-400 text-lg'>No plans available yet.</p>
              <p className='text-gray-300 text-sm mt-1'>
                Check back soon for new offers.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6'>
              {plans.map((plan, index) => {
                // ✅ Black bg if: user's active plan OR middle card (Most Popular)
                const isActivePlan = activePlanId === plan._id;
                const isPopular = index === 1;

                return (
                  <div
                    key={plan._id}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      isPopular
                        ? 'bg-black text-white border-black shadow-xl'
                        : isActivePlan
                          ? 'bg-green-50 text-white border-green-700 shadow-md'
                          : 'bg-white text-black border-gray-200 shadow-md'
                    }`}
                  >
                    {/* ✅ Badge: "Active Plan" if subscribed, else "Most Popular" for index 1 */}
                    {isActivePlan ? (
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                        <span className='bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap'>
                          ✓ Active Plan
                        </span>
                      </div>
                    ) : index === 1 ? (
                      <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                        <span className='bg-white text-black text-xs font-bold px-3 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap'>
                          Most Popular
                        </span>
                      </div>
                    ) : null}

                    <div className='p-6 flex flex-col flex-1'>
                      {/* Plan name + interval */}
                      <div className='mb-5'>
                        <h2 className='text-xl font-bold'>{plan.name}</h2>
                        <p
                          className={`text-sm capitalize mt-1 ${
                            isPopular ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {plan.billingInterval
                            ? `${plan.billingInterval}ly billing`
                            : 'One-time payment'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className='mb-6'>
                        <p
                          className={`text-4xl font-extrabold ${
                            isPopular ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {plan.price != null ? `$${plan.price}` : 'Free'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isPopular ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {plan.billingInterval === null
                            ? 'Unlimited downloads'
                            : `${plan.downloadLimit} downloads / ${plan.billingInterval}`}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isPopular ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          Daily {plan.dailyLimit} Files Download
                        </p>
                      </div>

                      {/* Divider */}
                      <hr
                        className={`mb-5 ${
                          isPopular ? 'border-gray-700' : 'border-gray-100'
                        }`}
                      />

                      {/* Features */}
                      <ul className='space-y-2 mb-8 flex-1'>
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span
                              className={`mt-0.5 flex-shrink-0 ${
                                isPopular ? 'text-white' : 'text-black'
                              }`}
                            >
                              ✓
                            </span>
                            <span
                              className={
                                isPopular ? 'text-gray-300' : 'text-gray-600'
                              }
                            >
                              {feature}
                            </span>
                          </li>
                        ))}

                        {plan.dailyLimit != null && (
                          <li className='flex items-start gap-2 text-sm'>
                            <span
                              className={`mt-0.5 flex-shrink-0 ${
                                isPopular ? 'text-white' : 'text-black'
                              }`}
                            >
                              ✓
                            </span>
                            <span
                              className={
                                isPopular ? 'text-gray-300' : 'text-gray-600'
                              }
                            >
                              Daily {plan.dailyLimit} Files Download
                            </span>
                          </li>
                        )}
                      </ul>

                      {/* ✅ Pass isActivePlan to PurchaseButton */}
                      <PurchaseButton
                        plan={plan}
                        isPopular={isPopular}
                        isActivePlan={isActivePlan}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Divider className='bg-gray-200' />
      <Footer />
    </>
  );
}
