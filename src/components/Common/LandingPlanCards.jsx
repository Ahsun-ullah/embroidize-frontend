import OfferCountdown from '@/components/Common/OfferCountdown';
import {
  bestValuePlanId,
  sortPlansForLanding,
} from '@/lib/apis/public/subscriptionPlans';
import {
  getPlanOffer,
  hasLiveOffer,
  money,
} from '@/lib/subscriptions/planPricing';
import Link from 'next/link';

/**
 * The plan cards for the standalone landing pages
 * (/holiday-embroidery-designs, /embroidery-subscription).
 *
 * Markup and class names are the approved design's; the contents — plan name,
 * discount, struck "was" price, headline price, renewal wording and feature
 * list — all come from the live plans through the same helpers the
 * /subscriptions page uses, so the offer reads identically wherever a visitor
 * meets it. A yearly plan is quoted per month with its term total underneath,
 * exactly as on /subscriptions, because that is the only framing that lets
 * someone compare it with the monthly plan at a glance.
 *
 * Both host pages define the `#i-check` sprite symbol used by the feature
 * bullets, and scope these class names under their own wrapper.
 *
 * Deliberately NOT a checkout: the CTA sends people to /subscriptions, where
 * PurchaseButton handles auth, the gateway and the "pay another way" path.
 *
 * Both designs draw a two-column grid because there are two paid plans. A third
 * plan wraps onto a second row rather than breaking; if the catalogue grows,
 * widen `.plans` on the host page instead of changing this component.
 *
 * @param {object[]} plans        plans from getSubscriptionPlans()
 * @param {object}   ctaLabels    per-term button copy, e.g.
 *                                { month: 'Start Monthly', year: 'Get Yearly Access' }
 * @param {string}   fallbackCta  button copy when the plans cannot be read
 */
export default function LandingPlanCards({
  plans = [],
  ctaLabels = {},
  fallbackCta = 'View Subscription Plans',
}) {
  // No plans readable: one honest button instead of an empty grid or, worse,
  // a placeholder price.
  if (!plans.length) {
    return (
      <div className='cta-row'>
        <Link className='btn btn--primary' href='/subscriptions'>
          {fallbackCta}
        </Link>
      </div>
    );
  }

  const ordered = sortPlansForLanding(plans);
  const bestId = bestValuePlanId(ordered);

  return (
    <>
      {/* Same daily offer clock as /subscriptions, and shown on the same
          condition: only when something is actually discounted. */}
      {hasLiveOffer(ordered) && (
        <p className='plan-clock'>
          Limited time offer — ends in <OfferCountdown />
        </p>
      )}

      <div className='plans'>
        {ordered.map((plan) => {
          const offer = getPlanOffer(plan);
          const isBest = plan._id === bestId;
          const label =
            ctaLabels[offer.term] ?? ctaLabels.fallback ?? 'Subscribe';

          return (
            <article
              key={plan._id}
              className={isBest ? 'plan plan--best' : 'plan'}
            >
              {isBest && <span className='plan__badge'>Best Value</span>}
              <p className='plan__name'>{plan.name}</p>

              <div className='plan__pricing'>
                {/* Kept in the flow even when empty so both cards' prices sit
                    on the same line. */}
                <div className='plan__offer'>
                  {Number(offer.savings) > 0 && (
                    <span className='plan__off'>{offer.savings}% OFF</span>
                  )}
                  {offer.showStrike && (
                    <span className='plan__was'>
                      {money(offer.strikePrice)}
                      {offer.headlineSuffix}
                    </span>
                  )}
                </div>

                <p className='plan__price'>
                  {money(offer.headlinePrice)}
                  {offer.headlineSuffix && <span> {offer.headlineSuffix}</span>}
                </p>

                {offer.termTotalLine && (
                  <p className='plan__term'>{offer.termTotalLine}</p>
                )}
                <p className='plan__renew'>{offer.renewNote}</p>
              </div>

              <ul className='plan__feats'>
                {(plan.features ?? []).map((feature, index) => (
                  <li key={index}>
                    <svg width='14' height='14' aria-hidden='true'>
                      <use href='#i-check' />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                className='btn btn--primary btn--block'
                href='/subscriptions'
              >
                {label}
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
