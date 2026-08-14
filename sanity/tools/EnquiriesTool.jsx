import React from 'react';
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';

/**
 * "Enquiries" screen.
 *
 * Deliberately a signpost rather than an inbox.
 *
 * Enquiries were briefly stored in Sanity so they could be listed here. That
 * had to be undone: Sanity's free plan only allows PUBLIC datasets, so those
 * records — names, emails, phone numbers — were readable by anyone who knew
 * the project ID, and that ID appears in every image URL on the site.
 *
 * They now live only where they are private: emailed on arrival, and kept in
 * Netlify's own dashboard behind its login.
 */
const FORMS_URL =
  'https://app.netlify.com/projects/colortek-site/forms';

export default function EnquiriesTool() {
  return (
    <Box padding={4}>
      <Stack space={4} style={{ maxWidth: 720 }}>
        <Text size={3} weight="semibold">Enquiries</Text>

        <Card padding={4} radius={2} border>
          <Stack space={4}>
            <Text size={1}>
              Every message sent through the contact form arrives by email at{' '}
              <strong>info@colortek.in</strong>, usually within a minute.
            </Text>

            <Text size={1}>
              A full, searchable history is kept in Netlify, where you can also
              export everything to a spreadsheet.
            </Text>

            <Flex>
              <Button
                mode="default"
                tone="primary"
                text="Open the enquiry inbox"
                onClick={() => window.open(FORMS_URL, '_blank', 'noopener')}
              />
            </Flex>
          </Stack>
        </Card>

        <Card padding={4} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} weight="semibold">Why enquiries are not listed here</Text>
            <Text size={1} muted>
              This admin panel stores website content, which is public by design.
              Enquiries contain personal details — names, email addresses and
              phone numbers — so they are kept separately, behind a login, rather
              than alongside content that anyone can read.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
