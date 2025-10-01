import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, TextField, InputAdornment, IconButton, CircularProgress, Typography, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ServiceCard from '../components/ServiceCard';
import { listServices } from '../services/api';

export default function Services() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listServices({ q: q || undefined, category: category || undefined, page: p, limit: 12 });
      setItems(res.data.items || []);
      setPage(res.data.pagination?.page || 1);
      setPages(res.data.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []); // initial

  const onSearch = () => fetchData(1);

  return (
    <Container sx={{ pt: 10, pb: 6 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search services…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
        <TextField
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small"
        />
        <IconButton onClick={onSearch}><SearchIcon /></IconButton>
        <IconButton onClick={() => { setQ(''); setCategory(''); fetchData(1); }}><RefreshIcon /></IconButton>
      </Box>

      {loading ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : items.length === 0 ? (
        <Typography sx={{ py: 8, textAlign: 'center', opacity: 0.7 }}>No services found.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((s) => (
              <Grid key={s._id} item xs={12} sm={6} md={4} lg={3}>
                <ServiceCard service={s} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination page={page} count={pages} onChange={(_, p) => fetchData(p)} />
          </Box>
        </>
      )}
    </Container>
  );
}
