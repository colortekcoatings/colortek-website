import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Spinner, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';

/**
 * "Enquiries" screen inside the admin panel.
 *
 * Reads from a server-side function rather than talking to Netlify directly,
 * so the Netlify API key never reaches the browser. The user's Sanity session
 * is sent along and checked by that function before anything is returned.
 */
export default function EnquiriesTool() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const authFetch = useCallback(
    async (init = {}) => {
      const token = client.config().token;
      return fetch('/api/enquiries' + (init.qs || ''), {
        method: init.method || 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    [client]
  );

  const load = useCallback(async () => {
    setError('');
    setRows(null);
    try {
      const res = await authFetch();

      // Netlify Functions do not run on the local dev server, so /api/enquiries
      // returns Astro's HTML 404 page. Parsing that as JSON gives an
      // "Unexpected token '<'" error, which tells the reader nothing.
      const type = res.headers.get('content-type') || '';
      if (!type.includes('application/json')) {
        throw new Error(
          'Enquiries are only available on the published site — this screen ' +
            'cannot load them while running on localhost. Open the admin panel ' +
            'on the live address instead.'
        );
      }

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not load enquiries');
      setRows(body.submissions || []);
    } catch (e) {
      setError(e.message);
      setRows([]);
    }
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.company, r.email, r.phone, r.substrate, r.message]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  const exportCsv = () => {
    const head = ['Date', 'Name', 'Company', 'Email', 'Phone', 'Substrate', 'Message'];
    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const csv = [
      head.join(','),
      ...filtered.map((r) =>
        [r.date, r.name, r.company, r.email, r.phone, r.substrate, r.message].map(esc).join(',')
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `colortek-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete the enquiry from ${row.name || 'this person'}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await authFetch({ method: 'DELETE', qs: `?id=${encodeURIComponent(row.id)}` });
      if (!res.ok) throw new Error('Could not delete');
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Flex align="center" gap={3} wrap="wrap">
          <Text size={3} weight="semibold">Enquiries</Text>
          <Box flex={1} />
          <Button mode="ghost" text="Refresh" onClick={load} disabled={busy} />
          <Button
            mode="ghost"
            tone="primary"
            text={`Download ${filtered.length} as spreadsheet`}
            onClick={exportCsv}
            disabled={!filtered.length}
          />
        </Flex>

        <Text size={1} muted>
          Every message sent through the contact form. These are also emailed to
          info@colortek.in as they arrive.
        </Text>

        <TextInput
          placeholder="Search by name, company, email or message"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />

        {error && (
          <Card padding={4} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {rows === null && (
          <Flex align="center" gap={3} padding={4}>
            <Spinner muted />
            <Text size={1} muted>Loading…</Text>
          </Flex>
        )}

        {rows !== null && !filtered.length && !error && (
          <Card padding={5} radius={2} tone="transparent" border>
            <Text size={1} muted align="center">
              {rows.length ? 'Nothing matches that search.' : 'No enquiries yet.'}
            </Text>
          </Card>
        )}

        <Stack space={3}>
          {filtered.map((r) => (
            <Card key={r.id} padding={4} radius={2} border>
              <Stack space={3}>
                <Flex align="center" gap={3} wrap="wrap">
                  <Text weight="semibold">{r.name || 'No name given'}</Text>
                  {r.company && <Text size={1} muted>{r.company}</Text>}
                  <Box flex={1} />
                  <Text size={1} muted>
                    {r.date ? new Date(r.date).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }) : ''}
                  </Text>
                </Flex>

                <Flex gap={4} wrap="wrap">
                  {r.email && <Text size={1}><a href={`mailto:${r.email}`}>{r.email}</a></Text>}
                  {r.phone && <Text size={1}><a href={`tel:${r.phone}`}>{r.phone}</a></Text>}
                  {r.substrate && <Text size={1} muted>Substrate: {r.substrate}</Text>}
                </Flex>

                {r.message && (
                  <Card padding={3} radius={2} tone="transparent">
                    <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>{r.message}</Text>
                  </Card>
                )}

                <Flex gap={2}>
                  {r.email && (
                    <Button
                      mode="ghost"
                      text="Reply by email"
                      onClick={() => {
                        window.location.href = `mailto:${r.email}?subject=Re: your enquiry to Colortek`;
                      }}
                    />
                  )}
                  <Box flex={1} />
                  <Button mode="bleed" tone="critical" text="Delete" onClick={() => remove(r)} disabled={busy} />
                </Flex>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
