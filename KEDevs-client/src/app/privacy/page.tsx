// src/app/privacy/page.tsx
'use client';

import React from 'react';
import { Container, Box, Typography, Paper, Divider, Stack } from '@mui/material';
import { PillBadge } from '@/components/shared/PillBadge';

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ bgcolor: 'background.subtle', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <PillBadge variant="mint">LEGAL</PillBadge>
          <Typography variant="h2" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>Privacy Policy</Typography>
          <Typography variant="body1" color="text.secondary">Last Updated: May 7, 2026</Typography>
        </Box>

        <Paper sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <Stack spacing={4}>
            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>1. Introduction</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Welcome to KEDevs-Connect. We are committed to protecting your personal information and your right to privacy. 
                If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
                please contact us at privacy@kedevs.com.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>2. Information We Collect</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We collect personal information that you voluntarily provide to us when registering at the Services, 
                expressing an interest in obtaining information about us or our products and services, 
                when participating in activities on the Services or otherwise contacting us.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                The personal information that we collect depends on the context of your interactions with us and the Services, 
                the choices you make and the products and features you use.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>3. How We Use Your Information</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We use personal information collected via our Services for a variety of business purposes described below. 
                We process your personal information for these purposes in reliance on our legitimate business interests, 
                in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </Typography>
              <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To send you marketing and promotional communications.</li>
                <li>To send administrative information to you.</li>
                <li>To fulfill and manage your orders.</li>
                <li>To post testimonials.</li>
              </ul>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>4. Will Your Information Be Shared With Anyone?</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We only share information with your consent, to comply with laws, to provide you with services, 
                to protect your rights, or to fulfill business obligations.
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>5. Contact Us</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                If you have questions or comments about this policy, you may email us at privacy@kedevs.com or by post to:
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                KEDevs Connect Ltd.<br />
                P.O. Box 12345-00100<br />
                Nairobi, Kenya
              </Typography>
            </section>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
