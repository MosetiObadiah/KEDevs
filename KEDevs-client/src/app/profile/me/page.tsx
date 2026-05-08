// src/app/profile/me/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Chip,
  Switch,
  Divider,
  Stack,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Autocomplete,
  Fade,
  Zoom,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PillBadge } from '@/components/shared/PillBadge';
import { developerService } from '@/services/developerService';

const COMMON_SKILLS = [
  'React', 'Java', 'Docker', 'Node.js', 'Python', 'TypeScript', 'Spring Boot', 'AWS', 
  'PostgreSQL', 'MongoDB', 'Next.js', 'Flutter', 'Kubernetes', 'GraphQL', 'TailWind CSS', 
  'Material UI', 'Redux', 'Go', 'Rust', 'C++', 'C#', 'Angular', 'Vue.js', 'Swift', 
  'Kotlin', 'PHP', 'Laravel', 'Symfony', 'Django', 'Flask', 'Express', 'NestJS',
  'MySQL', 'Redis', 'Elasticsearch', 'Terraform', 'Jenkins', 'Git', 'GitHub Actions',
  'Figma', 'Adobe XD', 'Unity', 'Unreal Engine', 'TensorFlow', 'PyTorch'
];

export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    id: '',
    firstName: '',
    lastName: '',
    bio: '',
    currentLastRole: '',
    yearsOfExperience: 'ZERO_TO_ONE',
    availabilityStatus: 'AVAILABLE',
    preferredWorkType: 'REMOTE',
    locationCity: '',
    locationCountry: '',
    profileVisibility: 'PUBLIC',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    publicEmail: '',
    publicPhone: '',
    skills: [],
    languages: [],
    education: [],
    certifications: [],
    ossContributions: [],
    achievements: [],
    projects: [],
    isVerified: false,
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    loadProfile(true);
  }, []);

  const loadProfile = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const response = await developerService.getMyProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to load profile.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateBasicInfo = async () => {
    setIsSaving(true);
    try {
      const response = await developerService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        currentLastRole: profile.currentLastRole,
        yearsOfExperience: profile.yearsOfExperience,
        preferredWorkType: profile.preferredWorkType,
        locationCity: profile.locationCity,
        locationCountry: profile.locationCountry,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        publicEmail: profile.publicEmail,
        publicPhone: profile.publicPhone,
      });
      if (response.success) {
        setIsEditing(false);
        setProfile({ ...profile, ...response.data });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update basic info.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (status: string) => {
    try {
      await developerService.updateAvailability({ availabilityStatus: status });
      setProfile({ ...profile, availabilityStatus: status });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async (visibility: string) => {
    try {
      await developerService.updateVisibility({ profileVisibility: visibility });
      setProfile({ ...profile, profileVisibility: visibility });
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------
  // Generic Handlers for Collections
  // ----------------------------------------------------------------

  const openAddDialog = (type: string) => {
    let initialNewItem = {};
    if (type === 'project') initialNewItem = { isFeatured: false };
    if (type === 'education') initialNewItem = { isCertification: false };
    
    setNewItem(initialNewItem);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDialogOpen(type);
  };

  const closeDialog = () => {
    setDialogOpen(null);
    setNewItem({});
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddItem = async (type: string) => {
    try {
      setIsSaving(true);
      switch (type) {
        case 'skill':
          await developerService.addSkill(newItem.skill);
          break;
        case 'language':
          await developerService.addLanguage(newItem.language);
          break;
        case 'education':
          await developerService.addEducation({
             ...newItem,
             isCertification: newItem.isCertification || false
          });
          break;
        case 'certification':
          await developerService.addCertification(newItem);
          break;
        case 'oss':
          await developerService.addOSS(newItem);
          break;
        case 'achievement':
          await developerService.addAchievement(newItem);
          break;
        case 'project':
          if (newItem.isFeatured && !selectedFile) {
            alert('A project screenshot is required to feature this project.');
            setIsSaving(false);
            return;
          }
          await developerService.addProject({
            ...newItem,
            isFeatured: newItem.isFeatured || false
          }, selectedFile || undefined);
          break;
      }
      loadProfile(false);
      closeDialog();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to add item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = async (type: string, identifier: string) => {
    if (!confirm('Are you sure you want to remove this?')) return;
    try {
      setIsRefreshing(true);
      switch (type) {
        case 'skill':
          await developerService.removeSkill(identifier);
          break;
        case 'language':
          await developerService.removeLanguage(identifier);
          break;
        case 'education':
          await developerService.deleteEducation(identifier);
          break;
        case 'certification':
          await developerService.deleteCertification(identifier);
          break;
        case 'oss':
          await developerService.deleteOSS(identifier);
          break;
        case 'achievement':
          await developerService.deleteAchievement(identifier);
          break;
        case 'project':
          await developerService.deleteProject(identifier);
          break;
      }
      loadProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to remove item.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFeaturedProject = async (projectId: string, currentFeatured: boolean) => {
    try {
      setIsRefreshing(true);
      await developerService.toggleFeaturedProject(projectId, !currentFeatured);
      loadProfile(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to toggle featured status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (type: string, id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      if (type === 'project') {
        await developerService.uploadProjectScreenshot(id, file);
      } else if (type === 'certification') {
        await developerService.uploadCertificationImage(id, file);
      }
      loadProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.subtle' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>Curating your professional story...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: 'background.subtle', 
      minHeight: '100vh', 
      py: { xs: 4, md: 8 },
      backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
    }}>
      <Container maxWidth="xl">
        {/* Top Floating Refresh Indicator */}
        {isRefreshing && (
          <Box sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
            <Paper sx={{ px: 3, py: 1, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white', boxShadow: 6 }}>
              <CircularProgress size={16} color="inherit" />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>Updating profile...</Typography>
            </Paper>
          </Box>
        )}

        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: { xs: 'center', md: 'flex-start' }, flexDirection: { xs: 'column', md: 'row' }, gap: 4, textAlign: { xs: 'center', md: 'left' } }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profile.profilePhoto}
                      sx={{
                        width: { xs: 120, md: 160 },
                        height: { xs: 120, md: 160 },
                        bgcolor: 'primary.main',
                        fontSize: '4rem',
                        fontWeight: 900,
                        border: '6px solid white',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }}
                    >
                      {profile.firstName?.charAt(0)}
                    </Avatar>
                    {profile.isVerified && (
                      <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', borderRadius: '50%', p: 0.5, boxShadow: 2 }}>
                        <VerifiedIcon color="primary" sx={{ fontSize: 32 }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ pt: { md: 2 } }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <PillBadge variant="mint">DEVELOPER PROFILE</PillBadge>
                      <PillBadge variant="neutral">{profile.yearsOfExperience?.replace(/_/g, ' ')}</PillBadge>
                    </Stack>
                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, mb: 1 }}>
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600, mb: 2, opacity: 0.8 }}>
                      {profile.currentLastRole || 'Awaiting Role Definition'}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography sx={{ fontWeight: 700 }}>{profile.locationCity || 'Location'}, {profile.locationCountry || 'Kenya'}</Typography>
                      </Box>
                      {profile.publicEmail && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <EmailIcon fontSize="small" />
                          <Typography sx={{ fontWeight: 700 }}>{profile.publicEmail}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-end' } }}>
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    onClick={() => isEditing ? handleUpdateBasicInfo() : setIsEditing(true)}
                    disabled={isSaving}
                    sx={{ 
                      borderRadius: 3, 
                      fontWeight: 800, 
                      px: 4, 
                      py: 1.8,
                      boxShadow: isEditing ? '0 10px 20px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                  >
                    {isSaving ? 'Saving Changes...' : (isEditing ? 'Save Changes' : 'Edit Identity')}
                  </Button>
                  {isEditing && (
                    <Button 
                      variant="text" 
                      color="inherit" 
                      onClick={() => setIsEditing(false)}
                      sx={{ fontWeight: 700 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Main Column */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* Professional Narrative */}
              <Paper sx={{ p: 5, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', bgcolor: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 3, letterSpacing: '-0.01em' }}>About Me</Typography>
                {isEditing ? (
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={5} 
                    label="Tell your story..." 
                    variant="filled"
                    value={profile.bio} 
                    onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                    sx={{ bgcolor: 'background.subtle', borderRadius: 2 }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'text.secondary', fontWeight: 500 }}>
                    {profile.bio || "Craft your professional narrative. What drives you as a developer?"}
                  </Typography>
                )}
              </Paper>

              {/* Expertise Matrix */}
              <Paper sx={{ p: 5, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Expertise Matrix</Typography>
                  <Button 
                    startIcon={<AddIcon />} 
                    variant="contained" 
                    size="small" 
                    onClick={() => openAddDialog('skill')}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Add Skill
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {profile.skills.map((skill: string) => (
                    <Zoom in key={skill}>
                      <Chip
                        label={skill}
                        onDelete={() => handleRemoveItem('skill', skill)}
                        sx={{ 
                          fontWeight: 800, 
                          px: 2, 
                          py: 2.8, 
                          borderRadius: 3, 
                          bgcolor: 'background.subtle',
                          border: '1px solid transparent',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'white',
                            color: 'primary.main'
                          },
                          transition: 'all 0.2s'
                        }}
                      />
                    </Zoom>
                  ))}
                  {profile.skills.length === 0 && (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>Your tech stack is currently empty.</Typography>
                  )}
                </Box>
              </Paper>

              {/* Showcase Projects */}
              <Paper sx={{ p: 5, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Projects Showcase</Typography>
                  <Button 
                    startIcon={<AddIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={() => openAddDialog('project')}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    New Project
                  </Button>
                </Box>
                <Stack spacing={4}>
                  {profile.projects.map((project: any) => (
                    <Fade in key={project.id}>
                      <Card sx={{ 
                        borderRadius: 4, 
                        overflow: 'hidden', 
                        boxShadow: project.isFeatured ? '0 20px 40px rgba(16, 185, 129, 0.1)' : '0 4px 10px rgba(0,0,0,0.02)',
                        border: project.isFeatured ? '2px solid' : '1px solid',
                        borderColor: project.isFeatured ? 'primary.main' : 'divider',
                        position: 'relative',
                        '&:hover .project-overlay': { opacity: 1 }
                      }}>
                        <Grid container>
                          <Grid item xs={12} md={5}>
                            <Box sx={{ position: 'relative', height: '100%', minHeight: 250, bgcolor: 'background.subtle' }}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundImage: project.screenshotUrl ? `url(${project.screenshotUrl})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'top center',
                                  transition: 'transform 0.5s ease',
                                  '&:hover': { transform: 'scale(1.05)' }
                                }}
                              >
                                {!project.screenshotUrl && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.1 }}>
                                    <CodeIcon sx={{ fontSize: 80 }} />
                                  </Box>
                                )}
                              </Box>
                              
                              {/* Overlay for viewing image */}
                              {project.screenshotUrl && (
                                <Box 
                                  className="project-overlay"
                                  onClick={() => setLightboxUrl(project.screenshotUrl)}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 0, left: 0, 
                                    width: '100%', height: '100%', 
                                    bgcolor: alpha('#000', 0.4), 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: 0, transition: 'opacity 0.3s ease', cursor: 'pointer'
                                  }}
                                >
                                  <Button variant="contained" startIcon={<VisibilityIcon />} sx={{ borderRadius: 5, fontWeight: 800 }}>View Screenshot</Button>
                                </Box>
                              )}

                              <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                                {project.isFeatured && <PillBadge variant="mint">FEATURED</PillBadge>}
                              </Box>
                              
                              <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  id={`project-upload-${project.id}`}
                                  onChange={(e) => handleFileUpload('project', project.id, e)}
                                />
                                <label htmlFor={`project-upload-${project.id}`}>
                                  <Tooltip title="Update Screenshot">
                                    <IconButton component="span" sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'white' } }}>
                                      <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </label>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={7}>
                            <CardContent sx={{ p: 4 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>{project.title}</Typography>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title={project.isFeatured ? "Unfeature" : "Feature on Profile"}>
                                    <IconButton size="small" onClick={() => handleToggleFeaturedProject(project.id, project.isFeatured)}>
                                      {project.isFeatured ? <StarIcon color="primary" /> : <StarBorderIcon />}
                                    </IconButton>
                                  </Tooltip>
                                  <IconButton size="small" color="error" onClick={() => handleRemoveItem('project', project.id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Stack>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 48, fontWeight: 500, lineHeight: 1.6 }}>
                                {project.description}
                              </Typography>
                              <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {project.techStack?.split(',').map((tech: string) => (
                                  <Chip key={tech} label={tech.trim()} size="small" sx={{ fontWeight: 700, bgcolor: 'background.subtle' }} />
                                ))}
                              </Box>
                              <Stack direction="row" spacing={2}>
                                {project.projectUrl && (
                                  <Button 
                                    variant="contained" 
                                    size="small" 
                                    startIcon={<OpenInNewIcon />} 
                                    href={project.projectUrl} 
                                    target="_blank"
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Live Demo
                                  </Button>
                                )}
                                {project.repoUrl && (
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    startIcon={<GitHubIcon />} 
                                    href={project.repoUrl} 
                                    target="_blank"
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Repository
                                  </Button>
                                )}
                              </Stack>
                            </CardContent>
                          </Grid>
                        </Grid>
                      </Card>
                    </Fade>
                  ))}
                  {profile.projects.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.subtle', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
                       <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Your portfolio is currently blank. Showcase your best work!</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column / Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Availability & Socials Card */}
              <Paper sx={{ p: 4, borderRadius: 6, bgcolor: 'primary.main', color: 'white', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, letterSpacing: '0.05em' }}>PREFERENCES</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.7, display: 'block', mb: 1, letterSpacing: '0.1em' }}>AVAILABILITY</Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={profile.availabilityStatus}
                      onChange={(e) => handleToggleAvailability(e.target.value)}
                      sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="OPEN_TO_OFFERS">Open to Offers</MenuItem>
                      <MenuItem value="NOT_AVAILABLE">Not Available</MenuItem>
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.7, display: 'block', mb: 1, letterSpacing: '0.1em' }}>VISIBILITY</Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={profile.profileVisibility}
                      onChange={(e) => handleToggleVisibility(e.target.value)}
                      sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSvgIcon-root': { color: 'white' }
                      }}
                    >
                      <MenuItem value="PUBLIC">Publicly Searchable</MenuItem>
                      <MenuItem value="PRIVATE">Logged-in Members</MenuItem>
                      <MenuItem value="HIDDEN">Admin Only</MenuItem>
                    </Select>
                  </Box>
                </Stack>
              </Paper>

              {/* Languages Card */}
              <Paper sx={{ p: 4, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Communication</Typography>
                  <IconButton size="small" color="primary" onClick={() => openAddDialog('language')}><AddIcon /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.languages.map((lang: string) => (
                    <Chip 
                      key={lang} 
                      label={lang} 
                      onDelete={() => handleRemoveItem('language', lang)} 
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  ))}
                  {profile.languages.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No languages defined.</Typography>}
                </Box>
              </Paper>

              {/* Certification & Education Card */}
              <Paper sx={{ p: 4, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Certifications</Typography>
                  <IconButton size="small" color="primary" onClick={() => openAddDialog('certification')}><AddIcon /></IconButton>
                </Box>
                <Stack spacing={3}>
                  {profile.certifications.map((cert: any) => (
                    <Box key={cert.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ bgcolor: 'secondary.main', p: 1, borderRadius: 2, color: 'white', display: 'flex' }}>
                        <WorkspacePremiumIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{cert.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{cert.issuedBy}</Typography>
                        {cert.certImageUrl && (
                          <Link 
                            component="button"
                            onClick={() => setLightboxUrl(cert.certImageUrl)}
                            sx={{ fontSize: '0.75rem', fontWeight: 700, mt: 0.5, display: 'inline-block', textDecoration: 'none' }}
                          >
                            View Credential Image
                          </Link>
                        )}
                      </Box>
                      <Stack direction="row">
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`cert-upload-${cert.id}`}
                          onChange={(e) => handleFileUpload('certification', cert.id, e)}
                        />
                        <label htmlFor={`cert-upload-${cert.id}`}>
                          <Tooltip title="Upload Credential Image">
                            <IconButton component="span" size="small"><CloudUploadIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </label>
                        <IconButton size="small" color="error" onClick={() => handleRemoveItem('certification', cert.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                
                <Divider sx={{ my: 4 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Education</Typography>
                  <IconButton size="small" color="primary" onClick={() => openAddDialog('education')}><AddIcon /></IconButton>
                </Box>
                <Stack spacing={3}>
                  {profile.education.map((edu: any) => (
                    <Box key={edu.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ bgcolor: 'background.subtle', p: 1, borderRadius: 2, color: 'primary.main', display: 'flex' }}>
                        <SchoolIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{edu.qualification}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{edu.institution}</Typography>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800 }}>{edu.startYear} - {edu.yearCompleted}</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemoveItem('education', edu.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* OSS & Achievements List */}
              <Paper sx={{ p: 4, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Achievements</Typography>
                  <IconButton size="small" color="primary" onClick={() => openAddDialog('achievement')}><AddIcon /></IconButton>
                </Box>
                <Stack spacing={2}>
                  {profile.achievements.map((a: any) => (
                    <Box key={a.id} sx={{ p: 2, bgcolor: 'background.subtle', borderRadius: 3, position: 'relative' }}>
                      <IconButton size="small" color="error" sx={{ position: 'absolute', top: 5, right: 5 }} onClick={() => handleRemoveItem('achievement', a.id)}><DeleteIcon fontSize="small" /></IconButton>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{a.year}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>{a.description}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* --- Lightbox / Image Viewer --- */}
        <Dialog 
          open={!!lightboxUrl} 
          onClose={() => setLightboxUrl(null)} 
          maxWidth="lg" 
          PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton 
              onClick={() => setLightboxUrl(null)} 
              sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
            >
              <DeleteIcon /> {/* Use X icon if available, Delete as placeholder */}
            </IconButton>
            <Box 
              component="img" 
              src={lightboxUrl || ''} 
              sx={{ width: '100%', maxHeight: '90vh', borderRadius: 4, display: 'block' }} 
            />
          </Box>
        </Dialog>

        {/* --- Unified Dialog System --- */}

        {/* Skill Dialog */}
        <Dialog open={dialogOpen === 'skill'} onClose={closeDialog} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 900 }}>Add Expertise</DialogTitle>
          <DialogContent>
            <Autocomplete
              options={COMMON_SKILLS}
              freeSolo
              onChange={(event, newValue) => setNewItem({ ...newItem, skill: newValue })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  autoFocus 
                  margin="dense" 
                  label="Search or Enter Skill" 
                  fullWidth 
                  variant="outlined" 
                  onBlur={(e) => setNewItem({ ...newItem, skill: e.target.value })}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
              onClick={() => handleAddItem('skill')} 
              variant="contained" 
              disabled={!newItem.skill || isSaving}
              sx={{ borderRadius: 2, fontWeight: 800 }}
            >
              Add Skill
            </Button>
          </DialogActions>
        </Dialog>

        {/* Language Dialog */}
        <Dialog open={dialogOpen === 'language'} onClose={closeDialog} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 900 }}>Add Language</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Language (e.g. Swahili, English)"
              fullWidth
              variant="outlined"
              value={newItem.language || ''}
              onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button onClick={() => handleAddItem('language')} variant="contained" disabled={!newItem.language || isSaving} sx={{ borderRadius: 2, fontWeight: 800 }}>Add Language</Button>
          </DialogActions>
        </Dialog>

        {/* Project Dialog */}
        <Dialog open={dialogOpen === 'project'} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 900 }}>Catalog New Project</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField label="Project Title" fullWidth value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
              <TextField label="Executive Summary" multiline rows={3} fullWidth value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              
              <Autocomplete
                multiple
                options={COMMON_SKILLS}
                freeSolo
                onChange={(event, newValue) => setNewItem({ ...newItem, techStack: newValue.join(', ') })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} size="small" />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Technology Stack" placeholder="Select or type..." />
                )}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Live URL" fullWidth value={newItem.projectUrl || ''} onChange={(e) => setNewItem({ ...newItem, projectUrl: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Repo URL" fullWidth value={newItem.repoUrl || ''} onChange={(e) => setNewItem({ ...newItem, repoUrl: e.target.value })} />
                </Grid>
              </Grid>
              
              <Box sx={{ p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: newItem.isFeatured ? 2 : 0 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Feature this project on profile?</Typography>
                    <Typography variant="caption" color="text.secondary">Requires a screenshot and live URL</Typography>
                  </Box>
                  <Switch 
                    checked={newItem.isFeatured || false} 
                    onChange={(e) => setNewItem({ ...newItem, isFeatured: e.target.checked })} 
                  />
                </Box>
                
                {newItem.isFeatured && (
                  <Fade in>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>Project Screenshot *</Typography>
                      {previewUrl ? (
                         <Box sx={{ position: 'relative', mb: 2 }}>
                            <Box 
                              component="img" 
                              src={previewUrl} 
                              sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} 
                            />
                            <IconButton 
                              onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                              sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                         </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          sx={{ py: 3, borderRadius: 2, borderStyle: 'dashed' }}
                        >
                          Upload Screenshot
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </Button>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
              onClick={() => handleAddItem('project')} 
              variant="contained" 
              disabled={isSaving || (newItem.isFeatured && !selectedFile)} 
              sx={{ borderRadius: 2, fontWeight: 800 }}
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Education Dialog */}
        <Dialog open={dialogOpen === 'education'} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 900 }}>Academic Background</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Institution" fullWidth value={newItem.institution || ''} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} />
              <TextField label="Degree / Qualification" fullWidth value={newItem.qualification || ''} onChange={(e) => setNewItem({ ...newItem, qualification: e.target.value })} />
              <TextField label="Field of Study" fullWidth value={newItem.fieldOfStudy || ''} onChange={(e) => setNewItem({ ...newItem, fieldOfStudy: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Start Year" type="number" fullWidth value={newItem.startYear || ''} onChange={(e) => setNewItem({ ...newItem, startYear: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="End Year" type="number" fullWidth value={newItem.yearCompleted || ''} onChange={(e) => setNewItem({ ...newItem, yearCompleted: e.target.value })} />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Is this a certification?</Typography>
                <Switch 
                  checked={newItem.isCertification || false} 
                  onChange={(e) => setNewItem({ ...newItem, isCertification: e.target.checked })} 
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button onClick={() => handleAddItem('education')} variant="contained" disabled={isSaving} sx={{ borderRadius: 2, fontWeight: 800 }}>Add Entry</Button>
          </DialogActions>
        </Dialog>

        {/* Certification Dialog */}
        <Dialog open={dialogOpen === 'certification'} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 900 }}>Professional Certification</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Certification Title" fullWidth value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <TextField label="Issuing Organization" fullWidth value={newItem.issuedBy || ''} onChange={(e) => setNewItem({ ...newItem, issuedBy: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                   <TextField label="Issue Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newItem.issuedDate || ''} onChange={(e) => setNewItem({ ...newItem, issuedDate: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                   <TextField label="Expiry Date (Optional)" type="date" fullWidth InputLabelProps={{ shrink: true }} value={newItem.expiryDate || ''} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} />
                </Grid>
              </Grid>
              <TextField label="Credential Verification URL" fullWidth value={newItem.certUrl || ''} onChange={(e) => setNewItem({ ...newItem, certUrl: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button onClick={() => handleAddItem('certification')} variant="contained" disabled={isSaving} sx={{ borderRadius: 2, fontWeight: 800 }}>Save Certificate</Button>
          </DialogActions>
        </Dialog>

        {/* Achievement Dialog */}
        <Dialog open={dialogOpen === 'achievement'} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 900 }}>Add Recognition</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Title of Recognition" fullWidth value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
              <TextField label="Year Received" type="number" fullWidth value={newItem.year || ''} onChange={(e) => setNewItem({ ...newItem, year: e.target.value })} />
              <TextField label="Context / Description" multiline rows={2} fullWidth value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              <TextField label="Evidence Link (URL)" fullWidth value={newItem.achievementUrl || ''} onChange={(e) => setNewItem({ ...newItem, achievementUrl: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button onClick={() => handleAddItem('achievement')} variant="contained" disabled={isSaving} sx={{ borderRadius: 2, fontWeight: 800 }}>Add Achievement</Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
