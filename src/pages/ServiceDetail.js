import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Chip, Button, Grid, Paper, CircularProgress } from '@mui/material';
import { getService, BASE_URL } from '../services/api';

export default function ServiceDetail({ onAuthOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getService(id);
      setService(res.data);
    } catch (e) {
      console.error(e);
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [id]);

  const imgRel = service?.images?.[0];
  const img = imgRel ? (imgRel.startsWith('http') ? imgRel : `${BASE_URL}${imgRel}`) : '/default-service.jpg';

  const handleRequest = () => {
    if (!user) {
      if (typeof onAuthOpen === 'function') onAuthOpen();
      return;
    }
    alert('This would go to a booking/request flow 😄');
  };

  if (loading) {
    return (
      <Box sx={{ pt: 12, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!service) return null;

  return (
    <Container sx={{ pt: 10, pb: 6 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <img src={img} alt={service.title} style={{ width: '100%', display: 'block' }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{service.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            {service.category || 'Service'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip label={`${service.currency || 'JPY'} ${service.price}`} color="primary" />
            {service.location && <Chip label={service.location} variant="outlined" />}
          </Box>

          <Typography sx={{ mt: 3 }}>{service.description}</Typography>

          <Box sx={{ mt: 4 }}>
            <Button variant="contained" size="large" onClick={handleRequest}>
              Request / Book
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Provider: {service.provider?.name || '—'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
