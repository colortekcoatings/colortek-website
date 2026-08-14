import React from 'react';
import { Box, Card, Flex, Grid, Stack, Text } from '@sanity/ui';

/**
 * The screen the client lands on.
 *
 * Written for someone who has never used a content system before: what the
 * left-hand list is, what Publish does, and the two things most likely to
 * confuse them (drafts, and changes taking a minute to appear).
 */
const STEPS = [
  {
    title: 'Change some words',
    body:
      'Pick a page from the list on the left. Click into any box, type your change, then press Publish at the bottom right.',
  },
  {
    title: 'Change a photo',
    body:
      'Click the picture you want to replace, choose Upload, and pick a new one. Add a short description of the photo — it is read aloud to blind visitors and helps the picture appear in Google Images.',
  },
  {
    title: 'Add a blog article',
    body:
      'Blog articles → the + button. Fill in the headline, summary, cover photo and text, then Publish. It appears on the website by itself.',
  },
  {
    title: 'Help your Google ranking',
    body:
      'Every page has a "Search & social" tab. That is the title and description Google shows. Keep the title under 60 characters and the description under 160 — the panel warns you if you go over.',
  },
];

const NOTES = [
  {
    title: 'Nothing is live until you press Publish',
    body:
      'Your edits save automatically as a draft, which only you can see. The website does not change until you Publish.',
  },
  {
    title: 'Changes take about a minute to appear',
    body:
      'After publishing, the website rebuilds itself. Give it a minute, then refresh the page you changed.',
  },
  {
    title: 'You cannot break the layout',
    body:
      'You can change any words and any pictures. The design stays as it is — there is no way to move things out of place.',
  },
];

export default function Welcome() {
  return (
    <Box padding={4}>
      <Stack space={5} style={{ maxWidth: 900 }}>
        <Stack space={3}>
          <Text size={4} weight="semibold">Colortek website</Text>
          <Text size={1} muted>
            This is where you change what appears on colortek.in — the words, the
            photos, and the wording Google shows in search results.
          </Text>
        </Stack>

        <Stack space={3}>
          <Text size={2} weight="semibold">How to do the usual things</Text>
          <Grid columns={[1, 1, 2]} gap={3}>
            {STEPS.map((s) => (
              <Card key={s.title} padding={4} radius={2} border>
                <Stack space={3}>
                  <Text weight="semibold" size={1}>{s.title}</Text>
                  <Text size={1} muted>{s.body}</Text>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>

        <Stack space={3}>
          <Text size={2} weight="semibold">Worth knowing</Text>
          <Stack space={2}>
            {NOTES.map((n) => (
              <Card key={n.title} padding={4} radius={2} tone="transparent" border>
                <Flex gap={3} align="flex-start">
                  <Box>
                    <Text weight="semibold" size={1}>{n.title}</Text>
                    <Box marginTop={2}>
                      <Text size={1} muted>{n.body}</Text>
                    </Box>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Stack>
        </Stack>

        <Card padding={4} radius={2} tone="primary" border>
          <Stack space={3}>
            <Text weight="semibold" size={1}>Stuck, or something looks wrong?</Text>
            <Text size={1}>
              Email Gaatha at digimarketing@gaa-tha.com. Nothing you do here can
              damage the website permanently — every change can be undone.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
