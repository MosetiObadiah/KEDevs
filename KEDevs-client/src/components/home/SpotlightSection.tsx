'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  alpha,
  Divider,
  Tooltip,
  Skeleton
} from '@mui/material';
import Link from 'next/link';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';
import { PillBadge } from '@/components/shared/PillBadge';

interface SpotlightSectionProps {
  dayDev: any;
  weekDev: any;
  loading: boolean;
}

function EmptySpotlightCard({ type }: { type: string }) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        minHeight: 400,
        borderRadius: 6, 
        overflow: 'hidden', 
        border: '2px dashed', 
        borderColor: 'divider',
        bgcolor: alpha('#000', 0.02),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha('#10b981', 0.02)
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <PillBadge variant="sage">{type}</PillBadge>
      </Box>

      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: 'background.paper', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 1
          }}
        >
          <SpeedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        </Box>
        
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Slot Available</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
            This spotlight spot is currently vacant. Verified developers can claim it to boost their visibility.
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          component={Link}
          href="/profile/me?buySpotlight=true"
          sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
        >
          Claim This Spot
        </Button>
      </Stack>
    </Card>
  );
}

function SpotlightBigCard({ dev, type }: { dev: any, type: string }) {
  const project = dev.featuredProjects?.[0];

  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 6, 
        overflow: 'hidden', 
        border: '1px solid', 
        borderColor: 'primary.light',
        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.08)',
        position: 'relative'
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
        <PillBadge variant="mint">{type}</PillBadge>
      </Box>

      <Grid container sx={{ height: '100%' }}>
        {/* Left: Dev Info */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ p: 4, bgcolor: alpha('#10b981', 0.03) }}>
          <Stack spacing={3} sx={{ height: '100%', alignItems: 'center', textAlign: 'center' }}>
            <Avatar 
              src={dev.profilePhoto} 
              sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3, bgcolor: 'primary.main', fontSize: '3rem', fontWeight: 900 }}
            >
              {dev.developerName?.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {dev.developerName}
                {dev.isVerified && <VerifiedIcon color="primary" fontSize="small" />}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 700 }}>
                {dev.currentLastRole}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flexGrow: 1 }}>
              {dev.bio || "Full-stack developer specializing in building scalable web applications."}
            </Typography>

            <Button 
              variant="contained" 
              fullWidth 
              component={Link} 
              href={`/developers/${dev.developerId}`}
              sx={{ borderRadius: 3, fontWeight: 800, py: 1.5 }}
            >
              View Profile
            </Button>
          </Stack>
        </Grid>

        {/* Right: Featured Project */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ p: 4, borderLeft: { md: '1px solid' }, borderColor: 'divider' }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>
            FEATURED PROJECT
          </Typography>
          
          {project ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box 
                sx={{ 
                  height: 180, 
                  borderRadius: 4, 
                  overflow: 'hidden', 
                  bgcolor: 'background.subtle',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {project.screenshotUrl ? (
                  <Box component="img" src={project.screenshotUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.1 }}>
                    <CodeIcon sx={{ fontSize: 60 }} />
                  </Box>
                )}
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{project.title}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, height: 48, overflow: 'hidden' }}>
                {project.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(Array.isArray(project.techStack) ? project.techStack : (project.techStack?.split(',') || [])).slice(0, 4).map((tech: string) => (
                  <Chip key={tech} label={tech.trim()} size="small" sx={{ fontWeight: 700, bgcolor: 'background.subtle', borderRadius: 1 }} />
                ))}
              </Box>

              {project.projectUrl && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<OpenInNewIcon />} 
                  href={project.projectUrl} 
                  target="_blank"
                  sx={{ borderRadius: 2, fontWeight: 700, mt: 1 }}
                >
                  Visit Project
                </Button>
              )}
            </Stack>
          ) : (
            <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.5 }}>
              <CodeIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="body2">No featured project listed yet.</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}

export default function SpotlightSection({ dayDev, weekDev, loading }: SpotlightSectionProps) {
  // Always show the section structure

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <PillBadge variant="mint">TALENT SPOTLIGHT</PillBadge>
          <Typography variant="h2" sx={{ mt: 2, fontWeight: 900 }}>
            Featured <Box component="span" sx={{ color: 'primary.main' }}>Talent</Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Exceptional Kenyan developers currently in the spotlight.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
            ) : dayDev ? (
              <SpotlightBigCard dev={dayDev} type="Developer of the Day" />
            ) : (
              <EmptySpotlightCard type="Developer of the Day" />
            )}
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
            ) : weekDev ? (
              <SpotlightBigCard dev={weekDev} type="Developer of the Week" />
            ) : (
              <EmptySpotlightCard type="Developer of the Week" />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
