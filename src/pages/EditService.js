import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography, Grid, Snackbar, Alert,
  MenuItem, InputAdornment, Divider, Stack, IconButton, CircularProgress
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import CurrencyYenIcon from '@mui/icons-material/CurrencyYen';
import RoomIcon from '@mui/icons-material/Room';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useNavigate, useParams } from 'react-router-dom';
import {
  getServiceOwner,
  getService,
  updateService,
  deleteService,
  uploadServiceImages,
  BASE_URL
} from '../services/api';

const categories = [
  'Cleaning', 'Moving', 'Translation', 'Repairs', 'Tutoring', 'IT Support', 'Other',
];
const currencies = ['JPY', 'USD', 'EUR'];

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    currency: 'JPY',
    location: '',
    isActive: true,
  });

  // Existing images from server (as relative paths)
  const [existingImages, setExistingImages] = useState([]); // ['/uploads/services/..', ...]
  const [removedIdx, setRemovedIdx] = useState(new Set());  // indexes in existingImages to drop

  // Newly picked files to upload
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!user || user.role !== 'service_provider') {
      navigate('/');
      return;
    }

    (async () => {
      try {
        // NOTE: backend getService only returns active & approved services.
        const res = await getServiceOwner(id);
        const s = res.data;

        setForm({
          title: s.title || '',
          category: s.category || '',
          description: s.description || '',
          price: s.price ?? '',
          currency: s.currency || 'JPY',
          location: s.location || '',
          isActive: !!s.isActive,
        });
        setExistingImages(Array.isArray(s.images) ? s.images : []);
      } catch (e) {
        setSnack({ open: true, severity: 'error', message: 'Failed to load service (must be active & approved).' });
        navigate('/provider/services');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onPickFiles = (e) => {
    const list = [...(e.target.files || [])];
    if (list.length === 0) return;
    setFiles((prev) => [...prev, ...list]);
    const newPreviews = list.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggleRemoveExistingAt = (idx) => {
    setRemovedIdx((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx); else n.add(idx);
      return n;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim())  return setSnack({ open: true, severity: 'warning', message: 'Title is required' });
    if (!form.description.trim()) return setSnack({ open: true, severity: 'warning', message: 'Description is required' });
    if (form.price === '' || Number(form.price) < 0)
      return setSnack({ open: true, severity: 'warning', message: 'Price must be a positive number' });

    try {
      setSaving(true);

      // 1) Upload any new files first
      let uploaded = [];
      if (files.length > 0) {
        const upRes = await uploadServiceImages(files);
        uploaded = upRes.data?.paths || [];
      }

      // 2) Build final images list: keep non-removed existing + newly uploaded
      const keptExisting = existingImages.filter((_, i) => !removedIdx.has(i));
      const finalImages = [...keptExisting, ...uploaded];

      // 3) Send update (we pass `images` to replace)
      await updateService(id, {
        title: form.title.trim(),
        category: form.category || undefined,
        description: form.description.trim(),
        price: Number(form.price),
        currency: form.currency || 'JPY',
        location: form.location || undefined,
        isActive: !!form.isActive,
        images: finalImages,
      });

      setSnack({ open: true, severity: 'success', message: 'Service updated!' });
      setTimeout(() => navigate('/provider/services'), 600);
    } catch (e) {
      setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      setDeleting(true);
      await deleteService(id);
      setSnack({ open: true, severity: 'success', message: 'Service deleted.' });
      setTimeout(() => navigate('/provider/services'), 400);
    } catch (e) {
      setDeleting(false);
      setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Delete failed' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ pt: 12, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
    );
  }

  return (
    <Container sx={{ pt: 10, pb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: (t) => (t.palette.mode === 'dark'
            ? '0 12px 30px rgba(0,0,0,0.35)'
            : '0 12px 24px rgba(2,6,23,0.08)')
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/provider/services')}>
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 900, flex: 1 }}>
            Edit Service
          </Typography>
          <Button
            color={form.isActive ? 'warning' : 'success'}
            startIcon={form.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
          >
            {form.isActive ? 'Set Inactive' : 'Set Active'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Stack>

        {/* BASIC INFO */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* DESCRIPTION */}
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={4}
          sx={{ mb: 2 }}
        />

        {/* PRICING */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyYenIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              fullWidth
            >
              {currencies.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* LOCATION */}
        <TextField
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          fullWidth
          placeholder="e.g., Tokyo, Shibuya..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <RoomIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* EXISTING IMAGES */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          Existing Images
        </Typography>
        {existingImages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No images yet.</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {existingImages.map((rel, idx) => {
              const url = rel.startsWith('http') ? rel : `${BASE_URL}${rel}`;
              const removed = removedIdx.has(idx);
              return (
                <Grid key={idx} item xs={6} sm={4} md={3}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: (t) => `2px solid ${removed ? t.palette.error.main : t.palette.divider}`
                    }}
                  >
                    <img
                      alt={`img-${idx}`}
                      src={url}
                      style={{ width: '100%', height: 140, objectFit: 'cover', filter: removed ? 'grayscale(100%)' : 'none' }}
                    />
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" noWrap sx={{ maxWidth: '80%' }}>
                        {rel.split('/').pop()}
                      </Typography>
                      <IconButton size="small" color={removed ? 'success' : 'error'} onClick={() => toggleRemoveExistingAt(idx)}>
                        {removed ? <VisibilityIcon fontSize="small" /> : <DeleteOutlineIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ADD NEW IMAGES */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          Add Images
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            component="label"
          >
            Select Images
            <input type="file" accept="image/*" hidden multiple onChange={onPickFiles} />
          </Button>
          <Typography variant="caption" sx={{ alignSelf: 'center' }}>
            JPG, PNG, WebP, GIF. You can select multiple files.
          </Typography>
        </Stack>

        {files.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {files.map((f, idx) => (
              <Grid key={idx} item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: (t) => `1px solid ${t.palette.divider}`
                  }}
                >
                  <img
                    alt={f.name}
                    src={previews[idx]}
                    style={{ width: '100%', height: 140, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" noWrap sx={{ maxWidth: '80%' }}>
                      {f.name}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => removeNewAt(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
