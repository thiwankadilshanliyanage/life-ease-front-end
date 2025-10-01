import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BASE_URL } from '../services/api';

const fallbackImg = '/default-service.jpg';

export default function ServiceCard({ service }) {
  const imgRel = service?.images?.[0];
  const img = imgRel
    ? (imgRel.startsWith('http') ? imgRel : `${BASE_URL}${imgRel}`)
    : fallbackImg;

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia component="img" height="160" image={img} alt={service.title} />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" noWrap>
          {service.category || 'Service'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap title={service.title}>
          {service.title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary" noWrap title={service.description}>
          {service.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Chip size="small" label={`${service.currency || 'JPY'} ${service.price}`} color="primary" />
          {service.location && <Chip size="small" label={service.location} variant="outlined" />}
        </Box>

        <Button
          component={RouterLink}
          to={`/services/${service._id}`}
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
          fullWidth
        >
          View details
        </Button>
      </CardContent>
    </Card>
  );
}
