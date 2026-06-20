// Configuration data for the upgrade cards shown in the Download Limit modal.
// Cards are generated from this array, so adding/removing/reordering a tier here
// updates the UI with no JSX changes. `name` is matched (case-insensitively)
// against the user's current plan name to highlight their active tier.
export const UPGRADE_TIERS = [
  { name: 'Basic', dailyLimit: 20, tagline: 'For hobby stitchers' },
  { name: 'Pro', dailyLimit: 40, tagline: 'For regular creators', popular: true },
  { name: 'Ultra', dailyLimit: 60, tagline: 'For power users' },
];
