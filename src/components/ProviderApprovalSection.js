import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Alert, Chip, MenuItem, Stack,
  InputAdornment, CircularProgress
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import InfoIcon from '@mui/icons-material/Info';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

import { getProfile, submitServiceProviderProfile } from '../services/api';

const BUSINESS_TYPES = [
  'Cleaning', 'Moving', 'Translation', 'Repairs', 'Tutoring', 'IT Support', 'Delivery',
  'Handyman', 'Consulting', 'Other',
];

const Field = (props) => <TextField size="small" fullWidth {...props} />;

export default function ProviderApprovalSection({ onRefreshUser }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // pending | approved | rejected | null
  const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });

  // Form state (match backend names)
  const [form, setForm] = useState({
    companyName: '',
    businessType: '',
    businessLicenseNumber: '',
    phoneNumber: '',
    website: '',
    address: '',
    description: '',
    servicesInput: '',      // UI helper for tag entry
    services: [],           // array to send
    experienceYears: '',
  });

  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addServiceTag = () => {
    const raw = (form.servicesInput || '').trim();
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const unique = Array.from(new Set([...(form.services || []), ...parts]));
    setForm((f) => ({ ...f, services: unique, servicesInput: '' }));
  };

  const removeServiceAt = (idx) => {
    setForm((f) => ({ ...f, services: f.services.filter((_, i) => i !== idx) }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const u = res.data.user || res.data;
      const sp = u?.serviceProviderProfile || null;
      const st = (sp?.approvalStatus || '').toLowerCase() || null;
      setStatus(st);

      setForm((f) => ({
        ...f,
        companyName: sp?.companyName || '',
        businessType: sp?.businessType || '',
        businessLicenseNumber: sp?.businessLicenseNumber || '',
        phoneNumber: sp?.phoneNumber || '',
        website: sp?.website || '',
        address: sp?.address || '',
        description: sp?.description || '',
        services: sp?.services || [],
        servicesInput: '',
        experienceYears: sp?.experienceYears ?? '',
      }));
    } catch (e) {
      // ignore; user may be non-provider
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.companyName.trim()) return 'Company name is required';
    if (!form.businessLicenseNumber.trim()) return 'Business license number is required';
    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) return 'Experience years must be ≥ 0';
    if (form.website && !/^https?:\/\//i.test(form.website)) return 'Website must start with http:// or https://';
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      setSnack({ open: true, severity: 'warning', msg: err });
      return;
    }
    try {
      setSubmitting(true);
      await submitServiceProviderProfile({
        companyName: form.companyName.trim(),
        businessType: form.businessType || undefined,
        businessLicenseNumber: form.businessLicenseNumber.trim(),
        phoneNumber: form.phoneNumber?.trim() || undefined,
        website: form.website?.trim() || undefined,
        address: form.address?.trim() || undefined,
        description: form.description?.trim() || undefined,
        services: form.services, // array
        experienceYears: form.experienceYears === '' ? undefined : Number(form.experienceYears),
      });
      setSnack({ open: true, severity: 'success', msg: 'Submitted for approval. You will be notified once reviewed.' });
      await load();
      onRefreshUser?.(); // let parent refresh its user cache if needed
    } catch (e) {
      setSnack({ open: true, severity: 'error', msg: e?.response?.data?.message || 'Submit failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Service Provider Verification
      </Typography>

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Status banner */}
          {isApproved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Approved — You can now create and manage services.
            </Alert>
          )}
          {isPending && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your profile is under review. You’ll be able to list services once approved.
            </Alert>
          )}
          {isRejected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your previous submission was rejected. Please correct details and resubmit.
            </Alert>
          )}

          {/* Form */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field
                label="Company Name *"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                select
                label="Business Type"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
              >
                {BUSINESS_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Field>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                label="Business License Number *"
                name="businessLicenseNumber"
                value={form.businessLicenseNumber}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field
                label="Website (https://...)"
                name="website"
                value={form.website}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                label="Experience (years)"
                name="experienceYears"
                type="number"
                inputProps={{ min: 0 }}
                value={form.experienceYears}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkHistoryIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><HomeWorkIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <Field
                label="Business Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                minRows={3}
                InputProps={{ startAdornment: <InputAdornment position="start"><InfoIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>

            {/* Services tags */}
            <Grid item xs={12} md={8}>
              <Field
                label="Services (type one or comma-separated and press Add)"
                name="servicesInput"
                value={form.servicesInput}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><BookmarkAddIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                onClick={addServiceTag}
                variant="outlined"
                sx={{ height: '100%', width: '100%' }}
              >
                Add Service
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {form.services.map((s, idx) => (
                  <Chip key={`${s}-${idx}`} label={s} onDelete={() => removeServiceAt(idx)} />
                ))}
              </Stack>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={submitting}
            >
              {isRejected ? 'Resubmit for Approval' : (status ? 'Update Submission' : 'Submit for Approval')}
            </Button>
          </Box>

          {/* Inline snackbar-style notice */}
          {snack.open && (
            <Box sx={{ mt: 1 }}>
              <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                {snack.msg}
              </Alert>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
