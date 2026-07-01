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

export default function StripeConfigWrapper({ settings }) {
  const router = useRouter();

  const [form, setForm] = useState({
    secretKey: '',
    publishableKey: settings?.publishableKey || '',
    webhookSecret: '',
    portalConfigurationId: settings?.portalConfigurationId || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, ...account } | { ok:false, message }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const authHeaders = () => {
    const token = Cookies.get('token');
    const finance = getFinanceToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (finance) h['x-finance-elevation'] = finance;
    return h;
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${apiBase()}/admin/settings/stripe/test`, {
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
      const headers = authHeaders();

      // Always send the non-secret fields; only send secrets if the admin typed
      // a new value (blank = keep the existing stored secret).
      const body = {
        publishableKey: form.publishableKey.trim(),
        portalConfigurationId: form.portalConfigurationId.trim(),
      };
      if (form.secretKey.trim()) body.secretKey = form.secretKey.trim();
      if (form.webhookSecret.trim()) body.webhookSecret = form.webhookSecret.trim();

      const res = await fetch(`${apiBase()}/admin/settings/stripe`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast('Saved', 'Stripe settings updated.', 3000);
      // Clear the secret inputs; the masked "Saved ···· last4" reflects state.
      setForm((f) => ({ ...f, secretKey: '', webhookSecret: '' }));
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
          <KeyRound size={22} /> Payment Keys (Stripe)
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          These override your <code className='font-mono'>.env</code> values.
          Secrets are encrypted before being stored.
        </p>
      </div>

      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <ShieldCheck size={16} className='mt-0.5 shrink-0' />
        <p>
          Secret key and webhook secret are stored <strong>encrypted</strong> and
          never shown again — only the last 4 characters. Leave a secret field{' '}
          <strong>blank to keep</strong> the current value; type a new value to
          replace it.
        </p>
      </div>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>Secret key (sk_live)</span>
          <StatusChip set={settings?.hasSecretKey} last4={settings?.secretKeyLast4} />
        </CardHeader>
        <CardBody>
          <Input
            type='password'
            placeholder={
              settings?.hasSecretKey
                ? `Saved — leave blank to keep (••••${settings.secretKeyLast4})`
                : 'sk_live_...'
            }
            value={form.secretKey}
            onValueChange={(v) => setField('secretKey', v)}
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
                : 'whsec_...'
            }
            value={form.webhookSecret}
            onValueChange={(v) => setField('webhookSecret', v)}
            autoComplete='off'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>
          Publishable key (pk_live)
        </CardHeader>
        <CardBody>
          <Input
            placeholder='pk_live_...'
            value={form.publishableKey}
            onValueChange={(v) => setField('publishableKey', v)}
            description='Not secret. Stored as-is.'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>
          Billing portal configuration ID
        </CardHeader>
        <CardBody>
          <Input
            placeholder='bpc_...'
            value={form.portalConfigurationId}
            onValueChange={(v) => setField('portalConfigurationId', v)}
            description='Used when opening the Stripe customer billing portal.'
          />
        </CardBody>
      </Card>

      {/* Connection test result */}
      {testResult && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            testResult.ok
              ? 'border-gray-300 bg-gray-50'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {testResult.ok ? (
            <div className='space-y-1'>
              <p className='flex items-center gap-2 font-semibold text-gray-900'>
                <CheckCircle2 size={16} /> Connected successfully
                <Chip
                  size='sm'
                  variant='flat'
                  className={
                    testResult.livemode
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }
                >
                  {testResult.livemode ? 'LIVE mode' : 'TEST mode'}
                </Chip>
              </p>
              <p className='text-gray-600'>
                Account: <span className='font-mono'>{testResult.accountId}</span>
                {testResult.businessName ? ` · ${testResult.businessName}` : ''}
              </p>
              <p className='text-gray-500 text-xs'>
                {[
                  testResult.email,
                  testResult.country?.toUpperCase(),
                  testResult.defaultCurrency?.toUpperCase(),
                  testResult.chargesEnabled ? 'charges enabled' : 'charges disabled',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
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
