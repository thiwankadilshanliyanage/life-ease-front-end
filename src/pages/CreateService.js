// src/pages/CreateService.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography, Grid, Snackbar, Alert,
  MenuItem, InputAdornment, Divider, Stack, IconButton, Chip, LinearProgress
} from '@mui/material';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import CurrencyYenIcon from '@mui/icons-material/CurrencyYen';
import RoomIcon from '@mui/icons-material/Room';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

import { createService, getProfile, uploadServiceImages } from '../services/api';
import { useNavigate } from 'react-router-dom';

const libraries = ['places'];

const SectionHeader = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 1.2, bgcolor: 'action.hover' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Box>
  </Box>
);

const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo

export default function CreateService() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    currency: 'JPY',
    location: '',           // human-readable address
  });

  // Map + location
  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(null); // {lat, lng}
  const [latLng, setLatLng] = useState(null); // final selected coords
  const autoRef = useRef(null);
  const mapRef = useRef(null);

  // Files
  const [files, setFiles] = useState([]);     // File[]
  const [previews, setPreviews] = useState([]); // object URLs
  const [uploading, setUploading] = useState(false);

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Load Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'gmaps',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries,
  });

  const categories = [
    'Cleaning', 'Moving', 'Translation', 'Repairs', 'Tutoring', 'IT Support', 'Other',
  ];
  const currencies = ['JPY', 'USD', 'EUR'];

  const fetchApproval = async () => {
    try {
      const res = await getProfile();
      const p = res.data?.user?.serviceProviderProfile || res.data?.serviceProviderProfile;
      const isApproved =
        p?.approvalStatus === 'approved' || p?.approved === true || p?.isApproved === true;
      setApproved(!!isApproved);
    } catch {
      setApproved(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'service_provider') {
      navigate('/');
      return;
    }
    fetchApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // File input change
  const onPickFiles = (e) => {
    const list = [...(e.target.files || [])];
    if (list.length === 0) return;
    setFiles((prev) => [...prev, ...list]);
    const newPreviews = list.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Map click: set marker + coords + reverse geocode address
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setLatLng({ lat, lng });

    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setForm((f) => ({ ...f, location: results[0].formatted_address }));
        }
      });
    }
  };

  // Autocomplete place picked
  const onPlaceChanged = () => {
    if (!autoRef.current) return;
    const place = autoRef.current.getPlace();
    if (!place || !place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCenter({ lat, lng });
    setMarker({ lat, lng });
    setLatLng({ lat, lng });
    setForm((f) => ({ ...f, location: place.formatted_address || place.name || '' }));

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  };

  // Controlled inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim())       return setSnack({ open: true, message: 'Title is required', severity: 'error' });
    if (!form.description.trim()) return setSnack({ open: true, message: 'Description is required', severity: 'error' });
    if (!form.price || Number(form.price) < 0)
      return setSnack({ open: true, message: 'Price must be a positive number', severity: 'error' });

    try {
      // 1) If files exist, upload first and get URLs
      let imageUrls = [];
      if (files.length > 0) {
        setUploading(true);
        const res = await uploadServiceImages(files);
        imageUrls = res.data?.paths || [];
        setUploading(false);
      }

      // 2) Create service with returned URLs + location data
      const payload = {
        title: form.title.trim(),
        category: form.category || undefined,
        description: form.description.trim(),
        price: Number(form.price),
        currency: form.currency || 'JPY',
        images: imageUrls, // ✅ server returns /uploads/services/...
        location: form.location.trim() || undefined,
        coordinates: latLng || undefined,    // if your backend supports {lat, lng}
      };

      await createService(payload);
      setSnack({ open: true, message: 'Service created!', severity: 'success' });
      setTimeout(() => navigate('/services'), 700);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create service';
      setSnack({ open: true, message: msg, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  if (!approved) {
    return (
      <Container sx={{ pt: 12, pb: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            You are not approved to create services
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please wait until an admin approves your provider profile. If you were just approved,
            click the button below to refresh your status.
          </Typography>
          <Button startIcon={<RefreshIcon />} onClick={fetchApproval} variant="contained">
            Refresh approval
          </Button>
        </Paper>
      </Container>
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
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
          Create a New Service
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Provide clear, complete details. Add images from your computer and pin your service location.
        </Typography>

        {/* BASIC INFO */}
        <SectionHeader icon={<TitleIcon />} title="Basic info" />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g. Deep Apartment Cleaning"
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
              placeholder="Choose a category"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
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
          placeholder="What’s included? How long does it take? Any requirements?"
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

        {/* LOCATION (MAP + AUTOCOMPLETE) */}
        <SectionHeader icon={<RoomIcon />} title="Location" subtitle="Search a place or click on the map to drop a marker." />
        {isLoaded ? (
          <>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <Autocomplete onLoad={(ref) => (autoRef.current = ref)} onPlaceChanged={onPlaceChanged}>
                <TextField
                  placeholder="Search address or place"
                  fullWidth
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </Autocomplete>
              {latLng && (
                <Chip
                  label={`lat: ${latLng.lat.toFixed(5)}, lng: ${latLng.lng.toFixed(5)}`}
                  variant="outlined"
                  sx={{ alignSelf: 'center' }}
                />
              )}
            </Stack>

            <Box sx={{ height: 360, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={12}
                onLoad={(map) => (mapRef.current = map)}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {marker && <Marker position={marker} />}
              </GoogleMap>
            </Box>
          </>
        ) : (
          <Typography sx={{ mb: 2 }}>Loading map…</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* IMAGES (FILE PICKER) */}
        <SectionHeader icon={<AddPhotoAlternateIcon />} title="Images" subtitle="Upload one or more images from your computer." />
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
            JPG, PNG, WebP. You can select multiple files.
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
                    <Typography variant="caption" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                      {f.name}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => removeFileAt(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">Uploading images…</Typography>
          </Box>
        )}

        {/* ACTIONS */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="text" onClick={() => navigate('/services')}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            Create Service
          </Button>
        </Box>
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
