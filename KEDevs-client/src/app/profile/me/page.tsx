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
  FormControlLabel,
  Link,
  Autocomplete,
  Fade,
  Zoom,
  alpha,
  Slider,
} from '@mui/material';
import Cropper from 'react-easy-crop';
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
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import XIcon from '@mui/icons-material/X';
import TwitterIcon from '@mui/icons-material/Twitter';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { PillBadge } from '@/components/shared/PillBadge';
import { KENYA_COUNTIES, INDUSTRIES } from '@/lib/constants';
import { developerService } from '@/services/developerService';
import { employerService } from '@/services/employerService';
import { spotlightService } from '@/services/spotlightService';
import BuySpotlightDialog from '@/components/profile/BuySpotlightDialog';

const COMMON_SKILLS = [
  'React', 'Java', 'Docker', 'Node.js', 'Python', 'TypeScript', 'Spring Boot', 'AWS', 
  'PostgreSQL', 'MongoDB', 'Next.js', 'Flutter', 'Kubernetes', 'GraphQL', 'TailWind CSS', 
  'Material UI', 'Redux', 'Go', 'Rust', 'C++', 'C#', 'Angular', 'Vue.js', 'Swift', 
  'Kotlin', 'PHP', 'Laravel', 'Symfony', 'Django', 'Flask', 'Express', 'NestJS',
  'MySQL', 'Redis', 'Elasticsearch', 'Terraform', 'Jenkins', 'Git', 'GitHub Actions',
  'Figma', 'Adobe XD', 'Unity', 'Unreal Engine', 'TensorFlow', 'PyTorch'
];

const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      canvas.width = 250;
      canvas.height = 250;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        250,
        250
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    image.onerror = (err) => reject(err);
  });
};

export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    contactPersonName: '',
    contactEmail: '',
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: 'TEN_TO_FIFTY',
    locationHQ: '',
    companyBio: '',
    logoUrl: '',
    twitterUrl: '',
  });

  const [spotlightStatus, setSpotlightStatus] = useState<any>(null);
  const [buySpotlightOpen, setBuySpotlightOpen] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile(true);
    if (user?.role === 'DEVELOPER') {
      fetchSpotlightStatus();
      if (searchParams.get('buySpotlight') === 'true') {
        setBuySpotlightOpen(true);
      }
    }
  }, [searchParams]);

  const fetchSpotlightStatus = async () => {
    try {
      const response = await spotlightService.getMyStatus();
      if (response.success) {
        setSpotlightStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch spotlight status', err);
    }
  };

  const loadProfile = async (initial = false) => {
    if (initial) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const response = user?.role === 'EMPLOYER'
        ? await employerService.getMyProfile()
        : await developerService.getMyProfile();
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
      const isEmp = user?.role === 'EMPLOYER';
      const payload = isEmp
        ? {
            contactPersonName: profile.contactPersonName || user?.fullName || 'Employer',
            companyName: profile.companyName,
            companyWebsite: profile.companyWebsite,
            industry: profile.industry,
            companySize: profile.companySize || 'TEN_TO_FIFTY',
            locationHQ: profile.locationHQ,
            companyBio: profile.companyBio,
            logoUrl: profile.logoUrl,
            linkedinUrl: profile.linkedinUrl,
            twitterUrl: profile.twitterUrl,
            contactEmail: profile.contactEmail,
          }
        : {
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
          };

      const response = isEmp
        ? await employerService.updateProfile(payload)
        : await developerService.updateProfile(payload);

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
          if (newItem.isFeatured) {
            if (!selectedFile) {
              alert('A project screenshot is required to feature this project.');
              setIsSaving(false);
              return;
            }
            if (!newItem.projectUrl) {
              alert('A Live URL is required to feature this project.');
              setIsSaving(false);
              return;
            }
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
      console.error('Failed to remove item', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    if (!currentFeatured) {
      const project = profile.projects.find((p: any) => p.id === projectId);
      if (project && (!project.projectUrl || !project.screenshotUrl)) {
        toast.error('A project screenshot and Live URL are required to feature this project.');
        return;
      }
    }
    try {
      setIsRefreshing(true);
      await developerService.toggleFeaturedProject(projectId, !currentFeatured);
      toast.success(!currentFeatured ? 'Project featured!' : 'Project unfeatured');
      loadProfile(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project status');
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
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>Curating your professional story...</Typography>
        </Stack>
      </Box>
    );
  }

  if (user?.role === 'EMPLOYER') {
    return (
      <Box sx={{ 
        bgcolor: 'background.subtle', 
        minHeight: '100vh', 
        py: { xs: 4, md: 8 },
        backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)'
      }}>
        <Container maxWidth="xl">
          {isRefreshing && (
            <Box sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
              <Paper sx={{ px: 3, py: 1, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white', boxShadow: 6 }}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Updating profile...</Typography>
              </Paper>
            </Box>
          )}

          <Fade in timeout={800}>
            <Box sx={{ mb: 6 }}>
              {!isEditing && (!profile.companyName || !profile.industry || !profile.locationHQ || !profile.companyBio) && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }} action={<Button color="inherit" size="small" sx={{ fontWeight: 800 }} onClick={() => setIsEditing(true)}>Complete Profile</Button>}>
                  Your company profile is incomplete. Click <strong>Complete Profile</strong> to add your company name, bio, and more.
                </Alert>
              )}
              <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: { xs: 'center', md: 'flex-start' }, flexDirection: { xs: 'column', md: 'row' }, gap: 4, textAlign: { xs: 'center', md: 'left' } }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={profile.logoUrl}
                        sx={{
                          width: { xs: 120, md: 160 },
                          height: { xs: 120, md: 160 },
                          bgcolor: 'background.paper',
                          border: '6px solid white',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          borderRadius: 4
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: '4rem', color: 'divider' }} />
                      </Avatar>
                      {profile.isVerified && (
                        <Box sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', borderRadius: '50%', p: 0.5, boxShadow: 2, zIndex: 2 }}>
                          <VerifiedIcon color="primary" sx={{ fontSize: 32 }} />
                        </Box>
                      )}
                      <IconButton
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: -10,
                          right: -10,
                          bgcolor: 'white',
                          boxShadow: 3,
                          '&:hover': { bgcolor: 'background.paper' },
                          width: 44,
                          height: 44,
                          zIndex: 2
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setCropImageSrc(reader.result as string);
                                setCrop({ x: 0, y: 0 });
                                setZoom(1);
                                setCropDialogOpen(true);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ pt: { md: 2 }, flexGrow: 1 }}>
                      {isEditing ? (
                         <Stack spacing={2} sx={{ width: '100%' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <TextField size="small" label="Company Name" value={profile.companyName || ''} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} fullWidth />
                              <TextField 
                                size="small" 
                                select 
                                label="Industry" 
                                value={profile.industry || ''} 
                                onChange={(e) => setProfile({ ...profile, industry: e.target.value })} 
                                fullWidth
                              >
                                {INDUSTRIES.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <TextField 
                                size="small" 
                                select
                                label="Headquarters County" 
                                value={profile.locationHQ ? profile.locationHQ.split(',')[0] : ''} 
                                onChange={(e) => setProfile({ ...profile, locationHQ: e.target.value ? `${e.target.value}, Kenya` : '' })} 
                                fullWidth
                              >
                                <MenuItem value="" disabled>Select county...</MenuItem>
                                {KENYA_COUNTIES.map((county) => (
                                  <MenuItem key={county} value={county}>
                                    {county}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <FormControl fullWidth size="small">
                                <InputLabel>Company Size</InputLabel>
                                <Select
                                  value={profile.companySize || 'TEN_TO_FIFTY'}
                                  label="Company Size"
                                  onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                                >
                                  <MenuItem value="ONE_TO_TEN">1-10 employees</MenuItem>
                                  <MenuItem value="TEN_TO_FIFTY">11-50 employees</MenuItem>
                                  <MenuItem value="FIFTY_TO_TWO_HUNDRED">51-200 employees</MenuItem>
                                  <MenuItem value="TWO_HUNDRED_PLUS">200+ employees</MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>
                         </Stack>
                      ) : (
                        <>
                          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            {profile.isApproved && <PillBadge variant="mint">APPROVED EMPLOYER</PillBadge>}
                            {profile.isVerified && <PillBadge variant="mint">VERIFIED</PillBadge>}
                            {profile.industry && <PillBadge variant="neutral">{profile.industry}</PillBadge>}
                          </Stack>
                          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1, color: profile.companyName ? 'text.primary' : 'text.disabled', fontStyle: profile.companyName ? 'normal' : 'italic' }}>
                            {profile.companyName || 'Company name not set'}
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon fontSize="small" />
                              <Typography sx={{ fontWeight: 700, color: profile.locationHQ ? 'text.secondary' : 'text.disabled' }}>
                                {profile.locationHQ || '— Not set'}
                              </Typography>
                            </Box>
                            {profile.companySize && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PeopleIcon fontSize="small" />
                                <Typography sx={{ fontWeight: 700 }}>{profile.companySize.replace(/_/g, ' ')} Employees</Typography>
                              </Box>
                            )}
                          </Stack>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <Button
                      variant={isEditing ? "contained" : "outlined"}
                      startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                      onClick={() => isEditing ? handleUpdateBasicInfo() : setIsEditing(true)}
                      disabled={isSaving}
                      sx={{ borderRadius: 3, fontWeight: 800, px: 4, py: 1.5 }}
                    >
                      {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Manage Profile')}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={4}>
                <Paper sx={{ p: 5, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', bgcolor: 'primary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Company Mission & Bio</Typography>
                  {isEditing ? (
                    <TextField 
                      fullWidth 
                      multiline 
                      rows={6} 
                      value={profile.companyBio || ''} 
                      onChange={(e) => setProfile({...profile, companyBio: e.target.value})}
                      placeholder="Describe your company culture, mission, and what you're looking for in developers..."
                    />
                  ) : (
                    profile.companyBio ? (
                      <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                        {profile.companyBio}
                      </Typography>
                    ) : (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: 'text.disabled', fontStyle: 'italic', mb: 1 }}>
                          No company bio yet.
                        </Typography>
                        <Button size="small" variant="outlined" onClick={() => setIsEditing(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>Add Bio</Button>
                      </Box>
                    )
                  )}
                </Paper>

                <Paper sx={{ p: 5, borderRadius: 6 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Contact Details</Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.subtle', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase' }}>Point of Contact</Typography>
                        {isEditing ? (
                          <TextField size="small" fullWidth value={profile.contactPersonName || ''} onChange={(e) => setProfile({...profile, contactPersonName: e.target.value})} />
                        ) : (
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.contactPersonName || 'HR Manager'}</Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.subtle', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase' }}>Contact Email</Typography>
                        {isEditing ? (
                          <TextField size="small" fullWidth value={profile.contactEmail || ''} onChange={(e) => setProfile({...profile, contactEmail: e.target.value})} />
                        ) : (
                          <Typography variant="h6" sx={{ fontWeight: 700, color: profile.contactEmail ? 'text.primary' : 'text.disabled', fontStyle: profile.contactEmail ? 'normal' : 'italic' }}>
                            {profile.contactEmail || (user?.email ? `${user.email} (account email)` : 'Not set')}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={4}>
                <Paper sx={{ p: 4, borderRadius: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Online Presence</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <LanguageIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>WEBSITE</Typography>
                        {isEditing ? (
                          <TextField size="small" fullWidth value={profile.companyWebsite || ''} onChange={(e) => setProfile({...profile, companyWebsite: e.target.value})} />
                        ) : (
                          <Link href={profile.companyWebsite} target="_blank" sx={{ display: 'block', fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                            {profile.companyWebsite?.replace(/^https?:\/\//, '') || 'Not set'}
                          </Link>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <LinkedInIcon sx={{ color: '#0077b5' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>LINKEDIN</Typography>
                        {isEditing ? (
                          <TextField size="small" fullWidth value={profile.linkedinUrl || ''} onChange={(e) => setProfile({...profile, linkedinUrl: e.target.value})} />
                        ) : (
                          <Link href={profile.linkedinUrl} target="_blank" sx={{ display: 'block', fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                            {profile.linkedinUrl ? 'Company Profile' : 'Not set'}
                          </Link>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <XIcon sx={{ color: 'text.primary' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>TWITTER / X</Typography>
                        {isEditing ? (
                          <TextField size="small" fullWidth value={profile.twitterUrl || ''} onChange={(e) => setProfile({...profile, twitterUrl: e.target.value})} />
                        ) : (
                          <Link href={profile.twitterUrl} target="_blank" sx={{ display: 'block', fontWeight: 700, color: 'text.primary', textDecoration: 'none' }}>
                            {profile.twitterUrl ? 'Follow Us' : 'Not set'}
                          </Link>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
                
              </Stack>
            </Grid>
          </Grid>
        </Container>
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
        {isRefreshing && (
          <Box sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
            <Paper sx={{ px: 3, py: 1, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white', boxShadow: 6 }}>
              <CircularProgress size={16} color="inherit" />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>Updating profile...</Typography>
            </Paper>
          </Box>
        )}

        <Fade in timeout={800}>
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={4} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', alignItems: { xs: 'center', md: 'flex-start' }, flexDirection: { xs: 'column', md: 'row' }, gap: 4, textAlign: { xs: 'center', md: 'left' }, width: '100%' }}>
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
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: 3,
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 40,
                        height: 40,
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCropImageSrc(reader.result as string);
                              setCrop({ x: 0, y: 0 });
                              setZoom(1);
                              setCropDialogOpen(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                    {profile.isVerified && (
                      <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'white', borderRadius: '50%', p: 0.5, boxShadow: 2 }}>
                        <VerifiedIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ pt: { md: 2 }, flexGrow: 1, width: '100%' }}>
                    {isEditing ? (
                      user?.role === 'EMPLOYER' ? (
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="Company Name" value={profile.companyName || ''} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} fullWidth />
                            <TextField size="small" label="Industry" value={profile.industry || ''} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} fullWidth />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="Contact Person Name" value={profile.contactPersonName || ''} onChange={(e) => setProfile({ ...profile, contactPersonName: e.target.value })} fullWidth />
                            <TextField size="small" label="Website URL" value={profile.companyWebsite || ''} onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })} fullWidth />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="Headquarters Location" value={profile.locationHQ || ''} onChange={(e) => setProfile({ ...profile, locationHQ: e.target.value })} fullWidth />
                            <FormControl fullWidth size="small">
                              <InputLabel id="company-size-label">Company Size</InputLabel>
                              <Select
                                labelId="company-size-label"
                                value={profile.companySize || 'TEN_TO_FIFTY'}
                                label="Company Size"
                                onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                              >
                                <MenuItem value="ONE_TO_TEN">1-10 employees</MenuItem>
                                <MenuItem value="TEN_TO_FIFTY">11-50 employees</MenuItem>
                                <MenuItem value="FIFTY_TO_TWO_HUNDRED">51-200 employees</MenuItem>
                                <MenuItem value="TWO_HUNDRED_PLUS">200+ employees</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                          <TextField size="small" label="Company Bio" value={profile.companyBio || ''} onChange={(e) => setProfile({ ...profile, companyBio: e.target.value })} fullWidth multiline rows={3} />
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="LinkedIn URL" value={profile.linkedinUrl || ''} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} fullWidth />
                            <TextField size="small" label="Twitter/X URL" value={profile.twitterUrl || ''} onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })} fullWidth />
                          </Stack>
                          <TextField size="small" label="Contact Email" value={profile.contactEmail || ''} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} fullWidth />
                        </Stack>
                      ) : (
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="First Name" value={profile.firstName || ''} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} fullWidth />
                            <TextField size="small" label="Last Name" value={profile.lastName || ''} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} fullWidth />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="Professional Title" value={profile.currentLastRole || ''} onChange={(e) => setProfile({ ...profile, currentLastRole: e.target.value })} fullWidth />
                            <FormControl fullWidth size="small">
                              <InputLabel id="years-of-experience-label">Years of Experience</InputLabel>
                              <Select
                                labelId="years-of-experience-label"
                                value={profile.yearsOfExperience || 'ZERO_TO_ONE'}
                                label="Years of Experience"
                                onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                              >
                                <MenuItem value="ZERO_TO_ONE">0 to 1 Year</MenuItem>
                                <MenuItem value="ONE_TO_THREE">1 to 3 Years</MenuItem>
                                <MenuItem value="THREE_TO_FIVE">3 to 5 Years</MenuItem>
                                <MenuItem value="FIVE_TO_TEN">5 to 10 Years</MenuItem>
                                <MenuItem value="TEN_PLUS">10+ Years</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="preferred-work-type-label">Preferred Work Type</InputLabel>
                              <Select
                                labelId="preferred-work-type-label"
                                value={profile.preferredWorkType || 'REMOTE'}
                                label="Preferred Work Type"
                                onChange={(e) => setProfile({ ...profile, preferredWorkType: e.target.value })}
                              >
                                <MenuItem value="REMOTE">Remote</MenuItem>
                                <MenuItem value="ONSITE">On-site</MenuItem>
                                <MenuItem value="HYBRID">Hybrid</MenuItem>
                                <MenuItem value="CONTRACT">Contract</MenuItem>
                                <MenuItem value="FULLTIME">Full-time</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField 
                              size="small" 
                              label="GitHub Profile URL" 
                              placeholder="https://github.com/yourusername"
                              value={profile.githubUrl || ''} 
                              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} 
                              fullWidth 
                              helperText="Required for verification"
                            />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="City" value={profile.locationCity || ''} onChange={(e) => setProfile({ ...profile, locationCity: e.target.value })} fullWidth />
                            <TextField size="small" label="Country" value={profile.locationCountry || ''} onChange={(e) => setProfile({ ...profile, locationCountry: e.target.value })} fullWidth />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="LinkedIn URL" value={profile.linkedinUrl || ''} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} fullWidth />
                            <TextField size="small" label="Portfolio URL" value={profile.portfolioUrl || ''} onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })} fullWidth />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField size="small" label="Public Email" value={profile.publicEmail || ''} onChange={(e) => setProfile({ ...profile, publicEmail: e.target.value })} fullWidth />
                            <TextField size="small" label="Public Phone" value={profile.publicPhone || ''} onChange={(e) => setProfile({ ...profile, publicPhone: e.target.value })} fullWidth />
                          </Stack>
                        </Stack>
                      )
                    ) : (
                      user?.role === 'EMPLOYER' ? (
                        <>
                          <Stack direction="row" spacing={1} sx={{ mb: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <PillBadge variant="mint">EMPLOYER PROFILE</PillBadge>
                            <PillBadge variant="neutral">Size: {profile.companySize?.replace(/_/g, ' ')}</PillBadge>
                          </Stack>
                          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, mb: 1 }}>
                            {profile.companyName || 'My Company'}
                          </Typography>
                          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600, mb: 2, opacity: 0.8 }}>
                            {profile.industry || 'Tech / Software'}
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <LocationOnIcon fontSize="small" />
                              <Typography sx={{ fontWeight: 700 }}>{profile.locationHQ || 'Location'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <EmailIcon fontSize="small" />
                              <Typography sx={{ fontWeight: 700 }}>Contact: {profile.contactPersonName || 'HR'}</Typography>
                            </Box>
                          </Stack>
                        </>
                      ) : (
                        <>
                          <Stack direction="row" spacing={1} sx={{ mb: 1.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', gap: 1 }}>
                             <PillBadge variant="mint">DEVELOPER PROFILE</PillBadge>
                             <PillBadge variant="neutral">Exp: {profile.yearsOfExperience?.replace(/_/g, ' ')}</PillBadge>
                             <PillBadge variant="sage">Work: {profile.preferredWorkType?.replace(/_/g, ' ') || 'REMOTE'}</PillBadge>
                           </Stack>
                          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, mb: 1 }}>
                            {profile.firstName} {profile.lastName}
                          </Typography>
                          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600, mb: 2, opacity: 0.8 }}>
                            {profile.currentLastRole || 'Awaiting Role Definition'}
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <LocationOnIcon fontSize="small" />
                              <Typography sx={{ fontWeight: 700 }}>{profile.locationCity || 'Location'}, {profile.locationCountry || 'Kenya'}</Typography>
                            </Box>
                             {profile.publicEmail && (
                               <Tooltip title="Public Email">
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                   <EmailIcon fontSize="small" />
                                   <Typography sx={{ fontWeight: 700 }}>{profile.publicEmail}</Typography>
                                 </Box>
                               </Tooltip>
                             )}
                             {profile.publicPhone && (
                               <Tooltip title="Public Phone">
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                   <PhoneIcon fontSize="small" />
                                   <Typography sx={{ fontWeight: 700 }}>{profile.publicPhone}</Typography>
                                 </Box>
                               </Tooltip>
                             )}
                             {profile.githubUrl && (
                               <Tooltip title="GitHub Repository">
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                   <GitHubIcon fontSize="small" />
                                   <Link href={profile.githubUrl} target="_blank" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                     {profile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                                   </Link>
                                 </Box>
                               </Tooltip>
                             )}
                           </Stack>
                           <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                             {profile.linkedinUrl && (
                               <IconButton component={Link} href={profile.linkedinUrl} target="_blank" size="small" sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { color: 'primary.main', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                 <LinkedInIcon fontSize="small" />
                               </IconButton>
                             )}
                             {profile.portfolioUrl && (
                               <IconButton component={Link} href={profile.portfolioUrl} target="_blank" size="small" sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { color: 'primary.main', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                 <LanguageIcon fontSize="small" />
                               </IconButton>
                             )}
                           </Stack>
                        </>
                      )
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-end' } }}>
                  <Button
                    variant={isEditing ? "contained" : "outlined"}
                    startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                    onClick={() => isEditing ? handleUpdateBasicInfo() : setIsEditing(true)}
                    disabled={isSaving}
                    sx={{ borderRadius: 3, fontWeight: 800, px: 4, py: 1.8 }}
                  >
                    {isSaving ? 'Saving...' : (isEditing ? 'Save' : 'Edit Identity')}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
              {user?.role === 'DEVELOPER' && (
                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                   <SpotlightStatusCard status={spotlightStatus} onBuy={() => setBuySpotlightOpen(true)} />
                </Box>
              )}
              
              <Paper sx={{ p: 5, borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', bgcolor: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>About Me</Typography>
                {isEditing ? (
                  <TextField fullWidth multiline rows={5} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
                ) : (
                  <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'text.secondary' }}>
                    {profile.bio || "Craft your story..."}
                  </Typography>
                )}
              </Paper>

              <Paper sx={{ p: 5, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Skills</Typography>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => openAddDialog('skill')}>Add Skill</Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {profile.skills.map((skill: string) => (
                    <Chip key={skill} label={skill} onDelete={() => handleRemoveItem('skill', skill)} sx={{ fontWeight: 800, px: 2, py: 2.5, borderRadius: 3 }} />
                  ))}
                </Box>
                {profile.languages.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Languages</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.languages.map((lang: string) => (
                        <Chip key={lang} label={lang} onDelete={() => handleRemoveItem('language', lang)} variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }} />
                      ))}
                    </Box>
                  </Box>
                )}
                <Button startIcon={<AddIcon />} size="small" variant="text" sx={{ mt: 2, fontWeight: 700 }} onClick={() => openAddDialog('language')}>Add Language</Button>
              </Paper>

              <Paper sx={{ p: 5, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Projects</Typography>
                  <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openAddDialog('project')}>New Project</Button>
                </Box>
                <Stack spacing={4}>
                  {profile.projects.map((project: any) => (
                    <Card key={project.id} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <Grid container>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <Box sx={{ height: 250, bgcolor: 'background.subtle', position: 'relative' }}>
                            {project.screenshotUrl ? (
                              <Box component="img" src={project.screenshotUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.1 }}><CodeIcon sx={{ fontSize: 80 }} /></Box>
                            )}
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                          <CardContent sx={{ p: 4 }}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                               <Box>
                                 <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{project.title}</Typography>
                                    {project.isFeatured && <PillBadge variant="mint">FEATURED</PillBadge>}
                                 </Stack>
                                 <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                               </Box>
                               <Stack direction="row">
                                 <Tooltip title={project.isFeatured ? "Unfeature project" : "Feature this project (requires screenshot + live URL)"}>
                                   <IconButton 
                                     color={project.isFeatured ? "primary" : "default"} 
                                     onClick={() => handleToggleFeatured(project.id, project.isFeatured)}
                                   >
                                     {project.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                                   </IconButton>
                                 </Tooltip>
                                 <IconButton color="error" onClick={() => handleRemoveItem('project', project.id)}><DeleteIcon /></IconButton>
                               </Stack>
                             </Box>
                             
                             <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
                               {project.projectUrl && <Button size="small" variant="contained" href={project.projectUrl} target="_blank" sx={{ borderRadius: 2 }}>Live Demo</Button>}
                               {project.repoUrl && <Button size="small" variant="outlined" href={project.repoUrl} target="_blank" sx={{ borderRadius: 2 }}>Source Code</Button>}
                               <Button size="small" variant="outlined" startIcon={<CloudUploadIcon />} component="label" sx={{ borderRadius: 2 }}>
                                 {project.screenshotUrl ? 'Update Screenshot' : 'Upload Screenshot'}
                                 <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload('project', project.id, e)} />
                               </Button>
                             </Stack>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 5, borderRadius: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Education</Typography>
                  <Button startIcon={<AddIcon />} variant="outlined" onClick={() => openAddDialog('education')}>Add Education</Button>
                </Box>
                <Stack spacing={3}>
                  {profile.education.map((edu: any) => (
                    <Box key={edu.id} sx={{ display: 'flex', gap: 3, p: 3, borderRadius: 4, bgcolor: 'background.subtle' }}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: 'white', height: 'fit-content' }}>
                        <SchoolIcon />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{edu.institution}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem('education', edu.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>{edu.qualification} in {edu.fieldOfStudy}</Typography>
                        <Typography variant="caption" color="text.secondary">Completed in {edu.yearCompleted}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 4, borderRadius: 6, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>OSS Work</Typography>
                      <IconButton color="primary" onClick={() => openAddDialog('oss')}><AddIcon /></IconButton>
                    </Box>
                    <Stack spacing={2}>
                      {profile.ossContributions.map((oss: any) => (
                        <Box key={oss.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>{oss.projectName}</Typography>
                          <Typography variant="caption" color="text.secondary">{oss.role}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>{oss.description}</Typography>
                          {oss.contributionUrl && <Link href={oss.contributionUrl} target="_blank" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>View Contribution</Link>}
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem('oss', oss.id)} sx={{ mt: 1 }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 4, borderRadius: 6, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>Achievements</Typography>
                      <IconButton color="primary" onClick={() => openAddDialog('achievement')}><AddIcon /></IconButton>
                    </Box>
                    <Stack spacing={2}>
                      {profile.achievements.map((ach: any) => (
                        <Box key={ach.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <EmojiEventsIcon color="warning" fontSize="small" />
                            <Typography variant="body1" sx={{ fontWeight: 800 }}>{ach.title}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{ach.year}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>{ach.description}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem('achievement', ach.id)} sx={{ mt: 1 }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={4}>
              {user?.role === 'DEVELOPER' && (
                <SpotlightStatusCard status={spotlightStatus} onBuy={() => setBuySpotlightOpen(true)} />
              )}
              
              <Paper sx={{ p: 4, borderRadius: 6, bgcolor: 'primary.main', color: 'white' }}>
                 <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>PREFERENCES</Typography>
                 <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>AVAILABILITY</Typography>
                      <Select fullWidth size="small" value={profile.availabilityStatus} onChange={(e) => handleToggleAvailability(e.target.value as string)} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}>
                        <MenuItem value="AVAILABLE">Available</MenuItem>
                        <MenuItem value="OPEN_TO_OFFERS">Open to Offers</MenuItem>
                        <MenuItem value="NOT_AVAILABLE">Not Available</MenuItem>
                      </Select>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>VISIBILITY</Typography>
                      <Select fullWidth size="small" value={profile.profileVisibility} onChange={(e) => handleToggleVisibility(e.target.value as string)} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}>
                        <MenuItem value="PUBLIC">Public</MenuItem>
                        <MenuItem value="PRIVATE">Private</MenuItem>
                        <MenuItem value="HIDDEN">Hidden</MenuItem>
                      </Select>
                    </Box>
                 </Stack>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 6 }}>
                 <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Certifications</Typography>
                 <Stack spacing={2}>
                    {profile.certifications.map((c: any) => (
                      <Box key={c.id} sx={{ display: 'flex', gap: 2 }}>
                        <WorkspacePremiumIcon color="secondary" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{c.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.issuedBy}</Typography>
                        </Box>
                      </Box>
                    ))}
                 </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <BuySpotlightDialog 
          open={buySpotlightOpen} 
          onClose={() => setBuySpotlightOpen(false)} 
          onSuccess={() => { fetchSpotlightStatus(); setBuySpotlightOpen(false); }}
          isVerified={profile.isVerified}
          hasFeaturedProject={profile.projects?.some((p: any) => p.isFeatured) || false}
        />

        {/* Add Item Dialog */}
        <Dialog open={!!dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
          <DialogTitle sx={{ fontWeight: 900 }}>
            Add {dialogOpen?.charAt(0).toUpperCase()}{dialogOpen?.slice(1)}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {dialogOpen === 'skill' && (
                <Autocomplete
                  options={COMMON_SKILLS}
                  freeSolo
                  value={newItem.skill || ''}
                  onChange={(_, val) => setNewItem({ ...newItem, skill: val })}
                  onInputChange={(_, val) => setNewItem({ ...newItem, skill: val })}
                  renderInput={(params) => <TextField {...params} label="Skill Name" placeholder="e.g. Java" fullWidth />}
                />
              )}
              {dialogOpen === 'language' && (
                <TextField label="Language Name" placeholder="e.g. Swahili" fullWidth value={newItem.language || ''} onChange={(e) => setNewItem({ ...newItem, language: e.target.value })} />
              )}
              {dialogOpen === 'education' && (
                <>
                  <TextField label="Institution" fullWidth value={newItem.institution || ''} onChange={(e) => setNewItem({ ...newItem, institution: e.target.value })} />
                  <TextField label="Qualification" fullWidth value={newItem.qualification || ''} onChange={(e) => setNewItem({ ...newItem, qualification: e.target.value })} />
                  <TextField label="Field of Study" fullWidth value={newItem.fieldOfStudy || ''} onChange={(e) => setNewItem({ ...newItem, fieldOfStudy: e.target.value })} />
                  <Stack direction="row" spacing={2}>
                    <TextField label="Start Year" type="number" fullWidth value={newItem.startYear || ''} onChange={(e) => setNewItem({ ...newItem, startYear: e.target.value })} />
                    <TextField label="Year Completed" type="number" fullWidth value={newItem.yearCompleted || ''} onChange={(e) => setNewItem({ ...newItem, yearCompleted: e.target.value })} />
                  </Stack>
                  <FormControlLabel control={<Switch checked={newItem.isCertification || false} onChange={(e) => setNewItem({ ...newItem, isCertification: e.target.checked })} />} label="This is a certification" />
                </>
              )}
              {dialogOpen === 'certification' && (
                <>
                  <TextField label="Certification Name" fullWidth value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                  <TextField label="Issued By" fullWidth value={newItem.issuedBy || ''} onChange={(e) => setNewItem({ ...newItem, issuedBy: e.target.value })} />
                  <TextField label="Credential URL" fullWidth value={newItem.certUrl || ''} onChange={(e) => setNewItem({ ...newItem, certUrl: e.target.value })} />
                </>
              )}
              {dialogOpen === 'oss' && (
                <>
                  <TextField label="Project Name" fullWidth value={newItem.projectName || ''} onChange={(e) => setNewItem({ ...newItem, projectName: e.target.value })} />
                  <TextField label="Your Role" fullWidth value={newItem.role || ''} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })} />
                  <TextField label="Contribution URL" fullWidth value={newItem.contributionUrl || ''} onChange={(e) => setNewItem({ ...newItem, contributionUrl: e.target.value })} />
                  <TextField label="Brief Description" fullWidth multiline rows={3} value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                </>
              )}
              {dialogOpen === 'achievement' && (
                <>
                  <TextField label="Achievement Title" fullWidth value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                  <TextField label="Year Received" type="number" fullWidth value={newItem.year || ''} onChange={(e) => setNewItem({ ...newItem, year: e.target.value })} />
                  <TextField label="Description" fullWidth multiline rows={3} value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                </>
              )}
              {dialogOpen === 'project' && (
                <>
                  <TextField label="Project Title" fullWidth value={newItem.title || ''} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                  <TextField label="Description" fullWidth multiline rows={3} value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                  <TextField label="Tech Stack (comma separated)" fullWidth value={newItem.techStack || ''} onChange={(e) => setNewItem({ ...newItem, techStack: e.target.value })} />
                  <Stack direction="row" spacing={2}>
                    <TextField label="Live URL" fullWidth value={newItem.projectUrl || ''} onChange={(e) => setNewItem({ ...newItem, projectUrl: e.target.value })} />
                    <TextField label="Repo URL" fullWidth value={newItem.repoUrl || ''} onChange={(e) => setNewItem({ ...newItem, repoUrl: e.target.value })} />
                  </Stack>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>PROJECT SCREENSHOT</Typography>
                    <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />}>
                      {selectedFile ? selectedFile.name : 'Choose File'}
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                    {previewUrl && <Box component="img" src={previewUrl} sx={{ mt: 2, width: '100%', borderRadius: 2, height: 150, objectFit: 'cover' }} />}
                  </Box>
                  <FormControlLabel control={<Switch checked={newItem.isFeatured || false} onChange={(e) => setNewItem({ ...newItem, isFeatured: e.target.checked })} />} label="Feature this project (requires screenshot + live URL)" />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeDialog} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button variant="contained" disabled={isSaving} onClick={() => handleAddItem(dialogOpen as string)} sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}>
              {isSaving ? <CircularProgress size={24} /> : 'Save Item'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Crop Dialog */}
        <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
          <DialogTitle sx={{ fontWeight: 900 }}>Crop Profile Photo</DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', width: '100%', height: 400, mt: 2, borderRadius: 3, overflow: 'hidden' }}>
              <Cropper
                image={cropImageSrc || ''}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </Box>
            <Box sx={{ mt: 4, px: 2 }}>
              <Typography gutterBottom sx={{ fontWeight: 700 }}>Zoom</Typography>
              <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, val) => setZoom(val as number)} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCropDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
            <Button 
              variant="contained" 
              disabled={isSaving}
              onClick={async () => {
                try {
                  setIsSaving(true);
                  const croppedBlob = await getCroppedImg(cropImageSrc!, croppedAreaPixels);
                  const file = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
                  
                  let response;
                  if (user?.role === 'EMPLOYER') {
                    response = await employerService.uploadLogo(file);
                  } else {
                    response = await developerService.uploadProfilePhoto(file);
                  }

                  if (response.success) {
                    setProfile(response.data);
                    setCropDialogOpen(false);
                  }
                } catch (err) {
                  console.error(err);
                  alert('Failed to crop and upload photo.');
                } finally {
                  setIsSaving(false);
                }
              }}
              sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Set Profile Photo'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

function SpotlightStatusCard({ status, onBuy }: { status: any, onBuy: () => void }) {
  const isActive = !!status;
  return (
    <Paper sx={{ p: 3, borderRadius: 6, background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f3f4f6', color: isActive ? 'white' : 'text.primary', position: 'relative', overflow: 'hidden' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <SpeedIcon />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>{isActive ? 'Spotlight Active!' : 'Get Spotlight'}</Typography>
        </Stack>
        {isActive ? (
          <Box>
            <Typography variant="body2">Developer of the {status.type}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Expires: {new Date(status.expiresAt).toLocaleString()}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary">Get featured on the landing page!</Typography>
            <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: 'white', color: 'primary.main', fontWeight: 800 }} onClick={onBuy}>Boost Profile</Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
