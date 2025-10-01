import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Box, Typography, Grid, CircularProgress, Alert,
  Button, Card, CardContent, CardMedia, Chip, Stack, IconButton, Tooltip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { listMyServices, getProfile, deleteService, updateService, BASE_URL } from '../services/api';

export default function MyServices() {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [approved, setApproved] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // approval
      const pr = await getProfile();
      const u = pr.data.user || pr.data;
      const ap = u?.serviceProviderProfile?.approvalStatus === 'approved';
      setApproved(ap);

      // list *my* services (include inactive/unapproved)
      const res = await listMyServices({ page: 1, limit: 100, includeInactive: 1, includeUnapproved: 1 });
      setItems(res.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'service_provider') {
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (sid) => {
    if (!window.confirm('Delete this service?')) return;
    await deleteService(sid);
    await fetchData();
  };

  const onToggleActive = async (s) => {
    await updateService(s._id, { isActive: !s.isActive });
    await fetchData();
  };

  if (loading) {
    return <Box sx={{ pt: 12, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Container sx={{ pt: 10, pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>My Services</Typography>
        {approved && (
          <Button startIcon={<AddIcon />} component={RouterLink} to="/provider/services/new" variant="contained">
            New Service
          </Button>
        )}
      </Box>

      {!approved && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You’re not approved yet. You can view existing services but can’t create new ones.
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography sx={{ py: 6, textAlign: 'center', opacity: 0.7 }}>
          No services yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((s) => {
            const imgRel = s.images?.[0];
            const img = imgRel ? (imgRel.startsWith('http') ? imgRel : `${BASE_URL}${imgRel}`) : '/default-service.jpg';
            return (
              <Grid key={s._id} item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia component="img" height="160" image={img} alt={s.title} />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                      {s.category || 'Service'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap title={s.title}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary" noWrap title={s.description}>
                      {s.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`${s.currency || 'JPY'} ${s.price}`} color="primary" />
                      {s.location && <Chip size="small" label={s.location} variant="outlined" />}
                      <Chip
                        size="small"
                        label={s.isActive ? 'Active' : 'Inactive'}
                        color={s.isActive ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      {s.adminStatus && (
                        <Chip
                          size="small"
                          label={`Admin: ${s.adminStatus}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button size="small" variant="contained" onClick={() => navigate(`/provider/services/${s._id}/edit`)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => onDelete(s._id)}>
                        Delete
                      </Button>
                      <Tooltip title={s.isActive ? 'Set inactive' : 'Set active'}>
                        <IconButton size="small" onClick={() => onToggleActive(s)}>
                          {s.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
