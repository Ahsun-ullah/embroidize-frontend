'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { getFinanceToken } from '@/lib/financeLock';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Textarea,
} from '@heroui/react';
import Cookies from 'js-cookie';
import {
  CheckCircle2,
  KeyRound,
  PlugZap,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function StatusChip({ set, last4 }) {
  if (set) {
    return (
      <Chip size='sm' variant='flat' className='bg-gray-900 text-white'>
        Saved · ••••{last4}
      </Chip>
    );
  }
  return (
    <Chip size='sm' variant='flat' className='bg-gray-100 text-gray-500'>
      Not set
    </Chip>
  );
}

export default function CreemConfigWrapper({
  settings,
  activeGateway,
  checkoutDisabledMessage,
}) {
  const router = useRouter();

  const [gateway, setGateway] = useState(activeGateway || 'stripe');
  const [switching, setSwitching] = useState(false);
  const [disabledMsg, setDisabledMsg] = useState(checkoutDisabledMessage || '');
  const [savingMsg, setSavingMsg] = useState(false);

  const [form, setForm] = useState({ apiKey: '', webhookSecret: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const authHeaders = () => {
    const token = Cookies.get('token');
    const finance = getFinanceToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (finance) h['x-finance-elevation'] = finance;
    return h;
  };

  const switchGateway = async (next) => {
    if (next === gateway) return;
    setSwitching(true);
    try {
      const res = await fetch(`${apiBase()}/admin/settings/payment-gateway`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          activePaymentGateway: next,
          checkoutDisabledMessage: disabledMsg,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to switch gateway');
      setGateway(next);
      SuccessToast(
        'Gateway updated',
        next === 'none'
          ? 'Payments are OFF — plans show a message instead of a pay button.'
          : `New checkouts now use ${next}.`,
        3500,
      );
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to switch gateway', 3000);
    } finally {
      setSwitching(false);
    }
  };

  const saveMessage = async () => {
    setSavingMsg(true);
    try {
      const res = await fetch(`${apiBase()}/admin/settings/payment-gateway`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          activePaymentGateway: gateway,
          checkoutDisabledMessage: disabledMsg,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save message');
      SuccessToast('Saved', 'Payments-off message updated.', 3000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save message', 3000);
    } finally {
      setSavingMsg(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${apiBase()}/admin/settings/creem/test`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Connection failed');
      setTestResult({ ok: true, ...result.data });
    } catch (err) {
      setTestResult({ ok: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body = {};
      if (form.apiKey.trim()) body.apiKey = form.apiKey.trim();
      if (form.webhookSecret.trim()) body.webhookSecret = form.webhookSecret.trim();

      const res = await fetch(`${apiBase()}/admin/settings/creem`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast('Saved', 'Creem settings updated.', 3000);
      setForm({ apiKey: '', webhookSecret: '' });
      router.refresh();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save settings', 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <KeyRound size={22} /> Payment Gateway
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Choose which provider processes <strong>new</strong> checkouts and
          manage Creem credentials. Existing subscriptions keep billing on the
          provider that created them.
        </p>
      </div>

      {/* ── Gateway toggle ─────────────────────────────────────────────── */}
      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Active gateway (new checkouts)</CardHeader>
        <CardBody className='space-y-3'>
          <div className='flex gap-3'>
            {[
              { key: 'stripe', label: 'Stripe' },
              { key: 'creem', label: 'Creem' },
              { key: 'none', label: 'Off' },
            ].map(({ key, label }) => {
              const active = gateway === key;
              return (
                <button
                  key={key}
                  type='button'
                  disabled={switching}
                  onClick={() => switchGateway(key)}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {label}
                  {active && (
                    <span className='ml-2 text-xs font-normal'>
                      {key === 'none' ? '· off' : '· live'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className='text-xs text-gray-500'>
            <strong>Off</strong> keeps the plans visible but replaces the pay
            button with the message below (no payments taken). Switching to Creem
            requires a saved, valid Creem API key and each plan mapped to a Creem
            product — test the connection first.
          </p>

          {/* Message shown to users when payments are off / a plan is unmapped */}
          <div className='pt-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              “Payments off” message
            </label>
            <Textarea
              minRows={2}
              placeholder="Subscriptions are temporarily unavailable. Please check back soon or contact us and we'll help you get set up."
              value={disabledMsg}
              onValueChange={setDisabledMsg}
            />
            <div className='flex justify-end mt-2'>
              <Button
                size='sm'
                variant='bordered'
                isLoading={savingMsg}
                onPress={saveMessage}
              >
                Save message
              </Button>
            </div>
            <p className='text-xs text-gray-400 mt-1'>
              Leave blank to use the default. Shown on the subscriptions page in
              place of the pay button.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <ShieldCheck size={16} className='mt-0.5 shrink-0' />
        <p>
          API key and webhook secret are stored <strong>encrypted</strong> and
          never shown again — only the last 4 characters. Leave a field{' '}
          <strong>blank to keep</strong> the current value; type a new value to
          replace it. Test vs live is auto-detected from the key prefix
          (<code className='font-mono'>creem_test_</code> vs{' '}
          <code className='font-mono'>creem_</code>).
        </p>
      </div>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>API key (creem_…)</span>
          <StatusChip set={settings?.hasApiKey} last4={settings?.apiKeyLast4} />
        </CardHeader>
        <CardBody>
          <Input
            type='password'
            placeholder={
              settings?.hasApiKey
                ? `Saved — leave blank to keep (••••${settings.apiKeyLast4})`
                : 'creem_test_... or creem_...'
            }
            value={form.apiKey}
            onValueChange={(v) => setField('apiKey', v)}
            autoComplete='off'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>Webhook signing secret</span>
          <StatusChip
            set={settings?.hasWebhookSecret}
            last4={settings?.webhookSecretLast4}
          />
        </CardHeader>
        <CardBody>
          <Input
            type='password'
            placeholder={
              settings?.hasWebhookSecret
                ? `Saved — leave blank to keep (••••${settings.webhookSecretLast4})`
                : 'Creem webhook secret'
            }
            value={form.webhookSecret}
            onValueChange={(v) => setField('webhookSecret', v)}
            autoComplete='off'
          />
        </CardBody>
      </Card>

      {testResult && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            testResult.ok
              ? 'border-gray-300 bg-gray-50'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {testResult.ok ? (
            <p className='flex items-center gap-2 font-semibold text-gray-900'>
              <CheckCircle2 size={16} /> Connected successfully
              <Chip
                size='sm'
                variant='flat'
                className={
                  testResult.mode === 'live'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-700'
                }
              >
                {testResult.mode === 'live' ? 'LIVE mode' : 'TEST mode'}
              </Chip>
              {typeof testResult.productCount === 'number' && (
                <span className='text-xs font-normal text-gray-500'>
                  {testResult.productCount} products
                </span>
              )}
            </p>
          ) : (
            <p className='flex items-center gap-2'>
              <XCircle size={16} /> {testResult.message}
            </p>
          )}
        </div>
      )}

      <div className='flex items-center justify-between gap-3'>
        <Button
          variant='bordered'
          startContent={<PlugZap size={16} />}
          isLoading={isTesting}
          onPress={handleTest}
        >
          Test connection
        </Button>
        <Button
          className='bg-gray-900 text-white'
          isLoading={isSaving}
          onPress={handleSave}
        >
          Save changes
        </Button>
      </div>

      <p className='text-xs text-gray-400'>
        “Test connection” uses the currently <strong>saved</strong> key — save
        first if you just pasted a new one.
      </p>
    </div>
  );
}
