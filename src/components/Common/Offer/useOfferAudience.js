'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';

/**
 * Who is looking at an offer, from the same cached /userinfo query every page
 * already makes (logged-out visitors simply get no data).
 *
 *   ready     — the account check has finished; render nothing before this,
 *               or a subscriber sees an ad flash and vanish
 *   canBuy    — false only for someone already on the offer's plan (the
 *               checkout would refuse them: "already on this plan")
 *   isFree    — no premium access right now (never subscribed, lapsed, or
 *               logged out) — the audience for the exit pop-up and banner
 *   loggedIn, firstName
 */
export function useOfferAudience(offer) {
  const { data, isLoading, isFetching } = useUserInfoQuery();
  const ready = !isLoading && !(isFetching && !data);
  const loggedIn = !!data?._id;
  const isSubscribed = !!data?.isSubscribed;
  const currentPlanId =
    data?.subscription?.planId?._id || data?.subscription?.planId || null;
  const onOfferPlan =
    isSubscribed && offer?.plan?._id && String(currentPlanId) === String(offer.plan._id);
  const firstName = (data?.name || '').trim().split(/\s+/)[0] || '';
  return {
    ready,
    loggedIn,
    isFree: !isSubscribed,
    canBuy: !onOfferPlan,
    firstName,
  };
}
