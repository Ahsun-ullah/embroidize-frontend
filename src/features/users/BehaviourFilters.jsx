'use client';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@heroui/react';
import { BEHAVIOUR_FILTER_KEYS } from '@/features/users/userFilters';

// Number fields of the behaviour panel. They debounce into the URL like the
// other text inputs on the Users page.
export const BEHAVIOUR_NUMBER_KEYS = [
  'window',
  'winMin',
  'winMax',
  'daysMin',
  'daysMax',
  'freeMin',
  'inactiveDays',
];

export const EVER_DOWNLOADED_OPTIONS = [
  ['', 'Any'],
  ['yes', 'Has downloaded'],
  ['no', 'Never downloaded'],
];

export const SUB_STATE_OPTIONS = [
  ['', 'Any'],
  ['active', 'Active'],
  ['cancelling', 'Cancelling at period end'],
  ['payment_failed', 'Payment failed'],
  ['lapsed', 'Lapsed (was subscribed)'],
  ['never', 'Never subscribed'],
];

export const SUB_STATE_LABELS = {
  active: 'Active',
  cancelling: 'Cancelling',
  payment_failed: 'Payment failed',
  lapsed: 'Lapsed',
  never: 'Never subscribed',
};

// Presets only FILL the fields below; every number stays editable afterwards.
// Applying one clears the other behaviour fields (and the plan filter), so
// two presets never mix. `plan` is set where the preset is about free users.
export const BEHAVIOUR_PRESETS = [
  { key: 'active', label: 'Active', hint: 'Downloaded in the last 14 days', values: { window: '14', winMin: '1' } },
  { key: 'regular', label: 'Regular', hint: '8+ download days in 30 days', values: { window: '30', daysMin: '8' } },
  { key: 'occasional', label: 'Occasional', hint: '2–7 download days in 30 days', values: { window: '30', daysMin: '2', daysMax: '7' } },
  { key: 'oneoff', label: 'One-off', hint: '1 download day in 30 days', values: { window: '30', daysMin: '1', daysMax: '1' } },
  { key: 'atrisk', label: 'At risk', hint: '3+ download days in 60 days, none in the last 14', values: { window: '60', daysMin: '3', inactiveDays: '14' } },
  { key: 'inactive', label: 'Inactive', hint: 'No download for 30 days', values: { inactiveDays: '30' } },
  { key: 'dormant', label: 'Dormant', hint: 'No download for 90 days', values: { inactiveDays: '90' } },
  { key: 'never', label: 'Never downloaded', hint: 'Signed up, 0 downloads', values: { everDownloaded: 'no' } },
  { key: 'freeonly', label: 'Free-only downloaders', hint: 'Free users with free downloads in 30 days', values: { plan: 'free', window: '30', freeMin: '1' } },
  { key: 'likely', label: 'Likely subscribers', hint: 'Free users, 3+ download days in 30 days', values: { plan: 'free', window: '30', daysMin: '3' } },
  { key: 'lapsed', label: 'Lapsed subscribers', hint: 'Subscription ended, not renewed', values: { subState: 'lapsed' } },
  { key: 'cancelling', label: 'Cancelling', hint: 'Turned off auto-renew', values: { subState: 'cancelling' } },
  { key: 'failed', label: 'Payment failed', hint: 'Renewal payment failing', values: { subState: 'payment_failed' } },
];

const PRESET_RESET_KEYS = [...BEHAVIOUR_FILTER_KEYS, 'plan', 'planId', 'activeWithin'];

// The URL changes a preset makes: its values, and every other behaviour key
// cleared.
export function presetChanges(preset) {
  const changes = {};
  PRESET_RESET_KEYS.forEach((k) => (changes[k] = ''));
  return { ...changes, ...preset.values };
}

// The preset the current filters exactly match, if any, so its chip shows as
// selected.
export function matchingPreset(filters) {
  return BEHAVIOUR_PRESETS.find((p) =>
    PRESET_RESET_KEYS.every((k) => (filters[k] || '') === (p.values[k] || '')),
  );
}

const labelOf = (options, value) =>
  options.find(([v]) => v === (value || ''))?.[1] || 'Any';

function NumberField({ label, placeholder, value, onChange, description }) {
  return (
    <Input
      size='sm'
      type='number'
      min={0}
      label={label}
      labelPlacement='outside'
      placeholder={placeholder}
      description={description}
      value={value}
      onValueChange={onChange}
    />
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-xs text-foreground'>{label}</span>
      <Dropdown>
        <DropdownTrigger>
          <Button
            size='sm'
            variant={value ? 'solid' : 'flat'}
            className={`justify-start ${value ? 'bg-black text-white' : ''}`}
          >
            {labelOf(options, value)}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`${label} filter`}
          selectionMode='single'
          selectedKeys={[value || 'any']}
          onAction={(k) => onChange(k === 'any' ? '' : String(k))}
        >
          {options.map(([v, l]) => (
            <DropdownItem key={v || 'any'}>{l}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

/**
 * The "Behaviour" block of the admin Users filters: one-click presets plus the
 * fields they fill. Number fields go through the page's debounced drafts;
 * selects and presets push to the URL straight away.
 */
export default function BehaviourFilters({ filters, drafts, setDraft, pushFilters }) {
  const selected = matchingPreset(filters);
  const windowLabel = `${filters.window || 30} days`;

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-gray-200 p-3'>
      <div className='flex flex-col gap-1'>
        <span className='text-sm font-semibold text-gray-900'>Behaviour</span>
        <span className='text-xs text-gray-500'>
          Pick a preset or type your own numbers. Presets only fill the fields;
          you can change any of them.
        </span>
      </div>

      <div className='flex flex-wrap gap-2'>
        {BEHAVIOUR_PRESETS.map((p) => {
          const on = selected?.key === p.key;
          return (
            <Button
              key={p.key}
              size='sm'
              radius='full'
              variant={on ? 'solid' : 'bordered'}
              className={on ? 'bg-black text-white' : ''}
              title={p.hint}
              onPress={() => pushFilters(presetChanges(p))}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-9'>
        <NumberField
          label='Window (days)'
          placeholder='30'
          value={drafts.window}
          onChange={(v) => setDraft('window', v)}
        />
        <NumberField
          label='Downloads min'
          placeholder='Any'
          value={drafts.winMin}
          onChange={(v) => setDraft('winMin', v)}
        />
        <NumberField
          label='Downloads max'
          placeholder='Any'
          value={drafts.winMax}
          onChange={(v) => setDraft('winMax', v)}
        />
        <NumberField
          label='Download days min'
          placeholder='Any'
          value={drafts.daysMin}
          onChange={(v) => setDraft('daysMin', v)}
        />
        <NumberField
          label='Download days max'
          placeholder='Any'
          value={drafts.daysMax}
          onChange={(v) => setDraft('daysMax', v)}
        />
        <NumberField
          label='Free downloads min'
          placeholder='Any'
          value={drafts.freeMin}
          onChange={(v) => setDraft('freeMin', v)}
        />
        <NumberField
          label='No download for (days)'
          placeholder='Off'
          value={drafts.inactiveDays}
          onChange={(v) => setDraft('inactiveDays', v)}
        />
        <Select
          label='Ever downloaded'
          value={filters.everDownloaded}
          options={EVER_DOWNLOADED_OPTIONS}
          onChange={(v) => pushFilters({ everDownloaded: v })}
        />
        <Select
          label='Subscription'
          value={filters.subState}
          options={SUB_STATE_OPTIONS}
          onChange={(v) => pushFilters({ subState: v })}
        />
      </div>

      <span className='text-xs text-gray-500'>
        Downloads, download days and free downloads count the last{' '}
        {windowLabel}. A download day is a calendar day (UTC) with at least one
        download. Staff downloads are never counted.
      </span>
    </div>
  );
}
