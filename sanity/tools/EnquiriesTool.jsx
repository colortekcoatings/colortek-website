import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Spinner, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';

/**
 * "Enquiries" screen in the admin panel.
 *
 * Reads enquiry documents straight from Sanity using the panel's own client,
 * which is already signed in as the current user. There is no custom endpoint
 * and no API key anywhere in this file.
 *
 * The first version of this screen called a Netlify function and tried to pass
 * a Sanity token to it. That could not work: in the browser Sanity
 * authenticates with cookies scoped to its own domain, which are never sent to
 * netlify.app. Reading from Sanity directly sidesteps the problem entirely.
 */
export default function EnquiriesTool() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setRows(null);
    try {
      const data = await client.fetch(
        `*[_type == "enquiry"]|order(receivedAt desc)[0...500]{
          _id, name, company, email, phone, substrate, message, receivedAt
        }`
      );
      setRows(data || []);
    } catch (e) {
      setError(e.message || 'Could not load enquiries');
      setRows([]);
    }
  }, [client]);

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
    const head = ['Received', 'Name', 'Company', 'Email', 'Phone', 'Substrate', 'Message'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      head.join(','),
      ...filtered.map((r) =>
        [r.receivedAt, r.name, r.company, r.email, r.phone, r.substrate, r.message].map(esc).join(',')
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `colortek-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete the enquiry from ${row.name || 'this person'}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await client.delete(row._id);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
    } catch (e) {
      setError(e.message || 'Could not delete that enquiry');
    } finally {
      setBusy(false);
    }
  };

  const when = (iso) =>
    iso
      ? new Date(iso).toLocaleString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '';

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
              {rows.length
                ? 'Nothing matches that search.'
                : 'No enquiries yet. New ones appear here automatically.'}
            </Text>
          </Card>
        )}

        <Stack space={3}>
          {filtered.map((r) => (
            <Card key={r._id} padding={4} radius={2} border>
              <Stack space={3}>
                <Flex align="center" gap={3} wrap="wrap">
                  <Text weight="semibold">{r.name || 'No name given'}</Text>
                  {r.company && <Text size={1} muted>{r.company}</Text>}
                  <Box flex={1} />
                  <Text size={1} muted>{when(r.receivedAt)}</Text>
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
                        window.location.href =
                          `mailto:${r.email}?subject=${encodeURIComponent('Re: your enquiry to Colortek')}`;
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
