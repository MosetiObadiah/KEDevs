// src/app/companies/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  Avatar,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import { companyService } from '@/services/companyService';
import { INDUSTRIES } from '@/lib/constants';

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await companyService.getPublicCompanies(0, 50);
        if (response.success) {
          setCompanies(response.data.content);
        }
      } catch (err: any) {
        setError('Failed to fetch companies.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = industryFilter === 'All' || company.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
        Company <Box component="span" sx={{ color: 'primary.main' }}>Directory</Box>
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 6, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Search by company name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <MenuItem value="All">All Industries</MenuItem>
              {INDUSTRIES.map(industry => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Results */}
      <Grid container spacing={3}>
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={company.id}>
              <Card 
                component={Link} 
                href={`/companies/${company.id}`}
                sx={{ 
                  textDecoration: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
                  <Avatar 
                    src={company.logoUrl}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'grey.100',
                      color: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    {!company.logoUrl && <BusinessIcon fontSize="large" />}
                  </Avatar>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {company.companyName}
                    </Typography>
                    {company.isApproved && <VerifiedIcon color="primary" fontSize="small" />}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {company.industry || 'Tech'} • {company.locationHQ}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {company.companySize?.replace('_', ' ') || 'Growing'}
                  </Typography>
                  
                  <Chip 
                    label="View Profile" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                No companies found.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
