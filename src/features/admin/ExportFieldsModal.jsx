'use client';

import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from '@heroui/react';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ─── CSV helpers ──────────────────────────────────────────────────────────────

// A cell that starts with one of these is run as a formula by Excel / Sheets /
// LibreOffice. Customer-controlled text (a name, a phone number) lands in these
// files, so such strings are prefixed with an apostrophe, which every
// spreadsheet shows as plain text. Real numbers are passed through untouched.
const FORMULA_START = /^[=+\-@\t\r]/;

function csvCell(value) {
  if (value == null) return '';
  if (typeof value === 'number')
    return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  let s = String(value);
  // Phone-shaped values ("+880 1700-000000") hold no formula, so they're left
  // as-is: the apostrophe would otherwise end up in a CRM import.
  if (FORMULA_START.test(s) && !/^[+-]?[\d\s().-]+$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(fields, rows) {
  const lines = [fields.map((f) => csvCell(f.label)).join(',')];
  rows.forEach((row) => {
    lines.push(
      fields
        .map((f) => {
          try {
            return csvCell(f.get(row));
          } catch {
            return '';
          }
        })
        .join(','),
    );
  });
  // CRLF + a UTF-8 BOM so Excel opens it with the right encoding (names with
  // accents, non-Latin scripts) instead of guessing Windows-1252.
  return `﻿${lines.join('\r\n')}\r\n`;
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readSaved(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSaved(storageKey, keys) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // Private window / blocked storage: the choice just isn't remembered.
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

/**
 * Pick which rows (current filtered view or everything) and which fields to
 * export, then download a CSV. Rows are exported in the order given, so pass
 * them already sorted the way the table shows them.
 *
 * fields: [{ key, label, group, default?: boolean, get: (row) => value }]
 */
export default function ExportFieldsModal({
  isOpen,
  onOpenChange,
  title = 'Export',
  fields,
  filteredRows,
  allRows,
  filterSummary = [],
  filenameBase = 'export',
  storageKey,
}) {
  const defaultKeys = useMemo(
    () => fields.filter((f) => f.default).map((f) => f.key),
    [fields],
  );

  const [selected, setSelected] = useState(() => new Set(defaultKeys));
  const [scope, setScope] = useState('filtered');

  // Restore the last field choice each time the dialog opens, and default the
  // scope to what's on screen.
  useEffect(() => {
    if (!isOpen) return;
    const known = new Set(fields.map((f) => f.key));
    const saved = storageKey ? readSaved(storageKey) : null;
    const keys = saved ? saved.filter((k) => known.has(k)) : defaultKeys;
    setSelected(new Set(keys.length ? keys : defaultKeys));
    setScope('filtered');
  }, [isOpen, fields, defaultKeys, storageKey]);

  const groups = useMemo(() => {
    const m = new Map();
    fields.forEach((f) => {
      const g = f.group || 'Fields';
      if (!m.has(g)) m.set(g, []);
      m.get(g).push(f);
    });
    return [...m.entries()];
  }, [fields]);

  const toggle = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const setGroup = (groupFields, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      groupFields.forEach((f) => (on ? next.add(f.key) : next.delete(f.key)));
      return next;
    });

  const hasFilters = filterSummary.length > 0;
  const rows = scope === 'all' ? allRows : filteredRows;
  const chosen = fields.filter((f) => selected.has(f.key));
  const canExport = chosen.length > 0 && rows.length > 0;

  const doExport = (onClose) => {
    if (!canExport) return;
    if (storageKey)
      writeSaved(
        storageKey,
        chosen.map((f) => f.key),
      );
    const date = new Date().toISOString().slice(0, 10);
    const suffix = scope === 'all' || !hasFilters ? 'all' : 'filtered';
    downloadText(
      buildCsv(chosen, rows),
      `${filenameBase}-${suffix}-${date}.csv`,
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop='blur'
      size='2xl'
      scrollBehavior='inside'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div>
                <p className='font-bold'>{title}</p>
                <p className='mt-0.5 text-xs font-normal text-gray-400'>
                  CSV file, opens in Excel, Google Sheets or Numbers.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className='gap-5'>
              <div>
                <p className='mb-2 text-sm font-semibold'>Rows</p>
                <RadioGroup value={scope} onValueChange={setScope} size='sm'>
                  <Radio
                    value='filtered'
                    description={
                      hasFilters
                        ? filterSummary.join(' · ')
                        : 'No filters set, so this is everyone'
                    }
                  >
                    Current view ({filteredRows.length})
                  </Radio>
                  <Radio
                    value='all'
                    description='Ignores search and every filter'
                  >
                    All ({allRows.length})
                  </Radio>
                </RadioGroup>
              </div>

              <div>
                <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-sm font-semibold'>
                    Fields{' '}
                    <span className='font-normal text-gray-400'>
                      ({chosen.length} of {fields.length})
                    </span>
                  </p>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant='light'
                      onPress={() =>
                        setSelected(new Set(fields.map((f) => f.key)))
                      }
                    >
                      All
                    </Button>
                    <Button
                      size='sm'
                      variant='light'
                      onPress={() => setSelected(new Set(defaultKeys))}
                    >
                      Default
                    </Button>
                    <Button
                      size='sm'
                      variant='light'
                      onPress={() => setSelected(new Set())}
                    >
                      None
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {groups.map(([group, groupFields]) => {
                    const on = groupFields.filter((f) =>
                      selected.has(f.key),
                    ).length;
                    const all = on === groupFields.length;
                    return (
                      <div
                        key={group}
                        className='rounded-lg border border-gray-100 p-3 dark:border-gray-800'
                      >
                        <Checkbox
                          size='sm'
                          isSelected={all}
                          isIndeterminate={on > 0 && !all}
                          onValueChange={(v) => setGroup(groupFields, v)}
                          classNames={{
                            label:
                              'text-xs font-semibold uppercase tracking-wide text-gray-500',
                          }}
                        >
                          {group}
                        </Checkbox>
                        <div className='mt-2 flex flex-col gap-1.5 pl-1'>
                          {groupFields.map((f) => (
                            <Checkbox
                              key={f.key}
                              size='sm'
                              isSelected={selected.has(f.key)}
                              onValueChange={() => toggle(f.key)}
                            >
                              <span className='text-sm'>{f.label}</span>
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='light' onPress={onClose}>
                Cancel
              </Button>
              <Button
                color='primary'
                startContent={<Download size={16} />}
                isDisabled={!canExport}
                onPress={() => doExport(onClose)}
              >
                {rows.length === 0
                  ? 'No rows to export'
                  : `Export ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
