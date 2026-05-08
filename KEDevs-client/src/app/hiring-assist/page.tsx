// src/app/hiring-assist/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
  Grid,
  TextField,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel,
  Avatar,
  Tooltip,
  IconButton,
  Modal,
  Alert,
  MenuItem
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SendIcon from '@mui/icons-material/Send';
import { developers } from '@/data/mockData';
import Link from 'next/link';

export default function HiringAssist() {
  const [isActive, setIsActive] = useState(false); // Mock session state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDev, setSelectedDev] = useState<any>(null);

  const handleActivate = () => setIsActive(true);

  if (!isActive) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper sx={{ p: { xs: 4, md: 8 }, textAlign: 'center', borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <SpeedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 4 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Hiring <Box component="span" sx={{ color: 'primary.main' }}>Assist</Box>
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Speed up your recruitment with advanced tools.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6, textAlign: 'left' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Advanced Filters</Typography>
                <Typography variant="body2" color="text.secondary">Filter developers by experience, availability, and specific tech combinations.</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Direct Outreach</Typography>
                <Typography variant="body2" color="text.secondary">Send personalized job requests directly to top candidates with one click.</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Saved Searches</Typography>
                <Typography variant="body2" color="text.secondary">Save your common search patterns and get notified of new matches.</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Pipeline Management</Typography>
                <Typography variant="body2" color="text.secondary">Organize your bookmarked developers into custom hiring stages.</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 4, borderRadius: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>KES 500</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>for 24 hours of full access</Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleActivate}
              sx={{ py: 2, borderRadius: 2, fontWeight: 700, fontSize: '1.1rem' }}
            >
              Activate Now
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Hiring <Box component="span" sx={{ color: 'primary.main' }}>Assist</Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Advanced search and outreach active.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Chip label="23:54:12 Remaining" color="warning" sx={{ fontWeight: 700, mb: 1 }} />
          <Button size="small" variant="outlined" sx={{ ml: 2 }}>Buy More Time</Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Advanced Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon /> Filters
            </Typography>
            <Stack spacing={3}>
              <TextField fullWidth label="Tech Stack" placeholder="e.g. React, Python" size="small" />
              <TextField fullWidth select label="Experience" defaultValue="3-5 years" size="small">
                <MenuItem value="0-1 years">0-1 years</MenuItem>
                <MenuItem value="1-3 years">1-3 years</MenuItem>
                <MenuItem value="3-5 years">3-5 years</MenuItem>
                <MenuItem value="5+ years">5+ years</MenuItem>
              </TextField>
              <TextField fullWidth select label="Availability" defaultValue="Available" size="small">
                <MenuItem value="Available">Available Now</MenuItem>
                <MenuItem value="Open">Open to Offers</MenuItem>
              </TextField>
              <TextField fullWidth label="City" defaultValue="Nairobi" size="small" />
              <FormControlLabel control={<Checkbox defaultChecked />} label="Verified Developers Only" />
              <Button variant="contained" fullWidth sx={{ borderRadius: 1.5, fontWeight: 700 }}>Apply Search</Button>
              <Button variant="text" size="small" sx={{ fontWeight: 700 }}>Save Search</Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={2}>
            {developers.filter(d => d.role === 'DEVELOPER').map((dev) => (
              <Paper key={dev.id} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'transparent', '&:hover': { borderColor: 'primary.main', boxShadow: 3 } }}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 2 }} sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, fontSize: '1.5rem' }}>
                      {dev.name.charAt(0)}
                    </Avatar>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component={Link} href={`/developers/${dev.id}`} sx={{ fontWeight: 700, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                        {dev.name}
                      </Typography>
                      {dev.isVerified && <Chip label="Verified" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{dev.role} • {dev.city}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {dev.skills.map(s => <Chip key={s} label={s} size="small" sx={{ height: 24 }} />)}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Bookmark">
                        <IconButton><BookmarkBorderIcon /></IconButton>
                      </Tooltip>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        size="small"
                        onClick={() => { setSelectedDev(dev); setIsModalOpen(true); }}
                        sx={{ borderRadius: 1.5, fontWeight: 700 }}
                      >
                        Job Request
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>

      {/* Outreach Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 24, p: 4
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Send Job Request</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Inviting <strong>{selectedDev?.name}</strong> to apply for a position.
          </Typography>

          <Stack spacing={3}>
            <TextField fullWidth select label="Select Job" defaultValue="1">
              <MenuItem value="1">Senior Full Stack Engineer</MenuItem>
              <MenuItem value="2">Junior React Developer</MenuItem>
            </TextField>
            <TextField fullWidth multiline rows={4} label="Personal Message" defaultValue={`Hi ${selectedDev?.name.split(' ')[0]}, I saw your profile on KEDevs and I'm impressed with your background in ${selectedDev?.skills[0]}. I'd love for you to check out this opening at TechFlow.`} />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Your contact email ({selectedDev?.email}) will be shared if they accept.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button fullWidth variant="contained" onClick={() => setIsModalOpen(false)}>Send Request</Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
}
