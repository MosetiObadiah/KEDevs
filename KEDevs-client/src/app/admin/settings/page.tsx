// src/app/admin/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { adminService } from '@/services/adminService';

interface SettingEntry {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

export default function PlatformSettings() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await adminService.getSettings();
        if (response.success) {
          const entries = Array.isArray(response.data)
            ? response.data.map((item: any) => ({ key: item.key, label: item.label || item.key, value: String(item.value), unit: item.unit || '' }))
            : Object.entries(response.data || {}).map(([key, value]) => ({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), value: String(value), unit: '' }));
          setSettings(entries);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load platform settings.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((item) => item.key === key ? { ...item, value } : item));
  };

  const handleSave = async (key: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const setting = settings.find((item) => item.key === key);
      if (!setting) return;
      await adminService.updateSetting(key, setting.value);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveAll = async () => {
    await Promise.all(settings.map((item) => adminService.updateSetting(item.key, item.value)));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Platform <Box component="span" sx={{ color: 'primary.main' }}>Settings</Box></Typography>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        All changes to platform configuration are applied instantly and recorded in the audit log.
      </Alert>

      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>General Configuration</Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>SETTING</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>VALUE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>UNIT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.map((s) => (
                  <TableRow key={s.key} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{s.label}</TableCell>
                    <TableCell sx={{ width: 200 }}>
                      <TextField fullWidth size="small" value={s.value} onChange={(e) => handleChange(s.key, e.target.value)} />
                    </TableCell>
                    <TableCell>{s.unit}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<SaveIcon />} variant="outlined" onClick={() => handleSave(s.key)} disabled={saving[s.key]}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }} onClick={() => window.location.reload()}>
            Reset to Defaults
          </Button>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }} onClick={handleSaveAll}>Save All Changes</Button>
        </Box>
      </Paper>
    </Box>
  );
}
