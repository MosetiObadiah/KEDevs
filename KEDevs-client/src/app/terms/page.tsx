// src/app/terms/page.tsx
'use client';

import React from 'react';
import { Container, Box, Typography, Paper, Divider, Stack } from '@mui/material';
import { PillBadge } from '@/components/shared/PillBadge';

export default function TermsOfServicePage() {
  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <PillBadge variant="mint">LEGAL</PillBadge>
          <Typography variant="h2" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>Terms of Service</Typography>
          <Typography variant="body1" color="text.secondary">Last Updated: May 7, 2026</Typography>
        </Box>

        <Paper sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <Stack spacing={4}>
            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>1. Agreement to Terms</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the terms, 
                then you may not access the Services.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>2. User Accounts</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>3. Content</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. 
                You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>4. Limitation of Liability</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                In no event shall KEDevs-Connect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>5. Governing Law</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                These Terms shall be governed and construed in accordance with the laws of Kenya, 
                without regard to its conflict of law provisions.
              </Typography>
            </section>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
