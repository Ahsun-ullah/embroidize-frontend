'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  useDisconnectPinterestMutation,
  useGetBoardsQuery,
  useGetPinterestAuthUrlMutation,
} from '@/lib/redux/admin/pinterest/pinterestSlice';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { CheckCircle2, Info, Link2, ShieldCheck, Unplug } from 'lucide-react';
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
        Saved{last4 ? ` · ••••${last4}` : ''}
      </Chip>
    );
  }
  return (
    <Chip size='sm' variant='flat' className='bg-gray-100 text-gray-500'>
      Not set
    </Chip>
  );
}

export default function PinterestConfigWrapper({ settings }) {
  const router = useRouter();

  const [form, setForm] = useState({
    appId: '',
    appSecret: '',
    defaultBoardId: settings?.defaultBoardId || '',
    descriptionTemplate: settings?.descriptionTemplate || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const isConnected = !!settings?.isConnected;
  const hasCredentials = !!settings?.hasAppId && !!settings?.hasAppSecret;

  // Boards only exist once an account is connected — skip the call otherwise so
  // a fresh install doesn't show a spurious "not connected" error.
  const { data: boards = [], isFetching: boardsLoading } = useGetBoardsQuery(
    undefined,
    { skip: !isConnected },
  );

  const [getAuthUrl, { isLoading: isConnecting }] =
    useGetPinterestAuthUrlMutation();
  const [disconnect, { isLoading: isDisconnecting }] =
    useDisconnectPinterestMutation();

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleConnect = async () => {
    try {
      const res = await getAuthUrl().unwrap();
      const url = res?.data?.url;
      if (!url) throw new Error('Could not build the Pinterest consent URL');
      // Full navigation, not a popup — Pinterest's consent screen refuses to
      // render inside a framed/popup context in several browsers.
      window.location.href = url;
    } catch (err) {
      ErrorToast(
        'Error',
        err?.data?.message || err.message || 'Could not start the connect flow',
        4000,
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect().unwrap();
      SuccessToast('Disconnected', 'Pinterest account disconnected.', 3000);
      router.refresh();
    } catch (err) {
      ErrorToast(
        'Error',
        err?.data?.message || 'Could not disconnect',
        3000,
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = Cookies.get('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const selectedBoard = boards.find((b) => b.id === form.defaultBoardId);

      // Secrets are only sent when the admin typed a new value; blank keeps
      // whatever is already stored.
      const body = {
        defaultBoardId: form.defaultBoardId,
        defaultBoardName: selectedBoard?.name || settings?.defaultBoardName || '',
        descriptionTemplate: form.descriptionTemplate,
      };
      if (form.appId.trim()) body.appId = form.appId.trim();
      if (form.appSecret.trim()) body.appSecret = form.appSecret.trim();

      const res = await fetch(`${apiBase()}/admin/settings/pinterest`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      SuccessToast('Saved', 'Pinterest settings updated.', 3000);
      setForm((f) => ({ ...f, appId: '', appSecret: '' }));
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
          <i className='ri-pinterest-fill text-[22px]' /> Pinterest
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Post product pins straight from the dashboard. Credentials are
          encrypted before being stored.
        </p>
      </div>

      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <Info size={16} className='mt-0.5 shrink-0' />
        <p>
          New Pinterest apps start on <strong>Trial access</strong>, where pins
          are sandbox entities visible only to the connected account. Pins become
          publicly visible once Pinterest grants{' '}
          <strong>Standard access</strong> — which requires submitting a video of
          this integration and its connect flow. Everything here works the same
          on both tiers.
        </p>
      </div>

      {/* Connection */}
      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>Connection</span>
          {isConnected ? (
            <Chip
              size='sm'
              variant='flat'
              className='bg-gray-900 text-white'
              startContent={<CheckCircle2 size={13} className='ml-1' />}
            >
              Connected
            </Chip>
          ) : (
            <Chip size='sm' variant='flat' className='bg-gray-100 text-gray-500'>
              Not connected
            </Chip>
          )}
        </CardHeader>
        <CardBody className='space-y-3'>
          {isConnected ? (
            <>
              <p className='text-sm text-gray-600'>
                Pinning as{' '}
                <span className='font-semibold text-gray-900'>
                  {settings?.connectedUsername
                    ? `@${settings.connectedUsername}`
                    : 'a connected account'}
                </span>
                .
              </p>
              <Button
                variant='bordered'
                startContent={<Unplug size={16} />}
                isLoading={isDisconnecting}
                onPress={handleDisconnect}
                className='w-fit'
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <p className='text-sm text-gray-600'>
                {hasCredentials
                  ? 'Credentials saved. Connect the Pinterest business account that pins should post to.'
                  : 'Save your app ID and secret below first, then connect.'}
              </p>
              <Button
                className='bg-gray-900 text-white w-fit'
                startContent={<Link2 size={16} />}
                isLoading={isConnecting}
                isDisabled={!hasCredentials}
                onPress={handleConnect}
              >
                Connect Pinterest
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* App credentials */}
      <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
        <ShieldCheck size={16} className='mt-0.5 shrink-0' />
        <p>
          From your app at{' '}
          <span className='font-mono'>developers.pinterest.com</span>. The secret
          is stored <strong>encrypted</strong> and never shown again — only the
          last 4 characters. Leave a field <strong>blank to keep</strong> the
          current value.
        </p>
      </div>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>App ID</span>
          <StatusChip set={settings?.hasAppId} />
        </CardHeader>
        <CardBody>
          <Input
            placeholder={
              settings?.hasAppId ? 'Saved — leave blank to keep' : '1234567'
            }
            value={form.appId}
            onValueChange={(v) => setField('appId', v)}
            autoComplete='off'
          />
        </CardBody>
      </Card>

      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='flex items-center justify-between'>
          <span className='font-semibold'>App secret</span>
          <StatusChip
            set={settings?.hasAppSecret}
            last4={settings?.appSecretLast4}
          />
        </CardHeader>
        <CardBody>
          <Input
            type='password'
            placeholder={
              settings?.hasAppSecret
                ? `Saved — leave blank to keep (••••${settings.appSecretLast4})`
                : 'App secret'
            }
            value={form.appSecret}
            onValueChange={(v) => setField('appSecret', v)}
            autoComplete='off'
          />
        </CardBody>
      </Card>

      {/* Default board */}
      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Default board</CardHeader>
        <CardBody>
          {isConnected ? (
            <Select
              placeholder={boardsLoading ? 'Loading boards…' : 'Select a board'}
              selectedKeys={form.defaultBoardId ? [form.defaultBoardId] : []}
              onSelectionChange={(keys) =>
                setField('defaultBoardId', Array.from(keys)[0] || '')
              }
              isDisabled={boardsLoading || boards.length === 0}
              description='Pre-selected in the pin dialog. You can still send any individual pin to a different board.'
            >
              {boards.map((b) => (
                <SelectItem key={b.id} textValue={b.name}>
                  {b.name}
                  {typeof b.pinCount === 'number' ? ` · ${b.pinCount} pins` : ''}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <p className='text-sm text-gray-500'>
              Connect an account to load your boards.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Caption template */}
      <Card className='border border-gray-200 shadow-none'>
        <CardHeader className='font-semibold'>Caption template</CardHeader>
        <CardBody className='space-y-2'>
          <Textarea
            minRows={4}
            placeholder='e.g. {{name}} — machine embroidery design. {{description}}'
            value={form.descriptionTemplate}
            onValueChange={(v) => setField('descriptionTemplate', v)}
          />
          <p className='text-xs text-gray-500'>
            Placeholders:{' '}
            <code className='font-mono'>{'{{name}}'}</code>,{' '}
            <code className='font-mono'>{'{{category}}'}</code>,{' '}
            <code className='font-mono'>{'{{subcategory}}'}</code>,{' '}
            <code className='font-mono'>{'{{description}}'}</code>,{' '}
            <code className='font-mono'>{'{{keywords}}'}</code>. Leave blank to
            use the product&apos;s meta description. This only pre-fills the pin
            dialog — you can edit any pin before posting.
          </p>
        </CardBody>
      </Card>

      <div className='flex justify-end'>
        <Button
          className='bg-gray-900 text-white'
          isLoading={isSaving}
          onPress={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
