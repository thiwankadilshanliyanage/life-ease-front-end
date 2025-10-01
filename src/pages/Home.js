import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Slider from 'react-slick';

import ServiceCard from '../components/ServiceCard';
import { listServices } from '../services/api';

import slide1 from '../assets/slider1.jpg';
import slide2 from '../assets/slider2.jpg';
import slide3 from '../assets/slider3.jpg';

const Home = () => {
  // --- your slider settings, unchanged ---
  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true
  };

  const slides = [slide1, slide2, slide3];

  // --- new: lightweight services teaser state ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch a handful of services (random 8 from first 50)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await listServices({ page: 1, limit: 50 }); // backend should support this
        const all = res.data.items || [];
        const random8 = all.sort(() => 0.5 - Math.random()).slice(0, 8);
        setItems(random8);
      } catch (e) {
        console.error('Failed to load services for home:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {/* ----- HERO (unchanged) ----- */}
      <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Slider {...sliderSettings}>
          {slides.map((img, idx) => (
            <Box key={idx}>
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                style={{ width: '100vw', height: 'calc(100vh - 64px)', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Slider>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            px: 2
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' }
            }}
          >
            Welcome to LifeEase Japan
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Helping foreigners thrive in Japan with jobs, housing, and more.
          </Typography>
        </Box>
      </Box>

      {/* ----- SERVICES TEASER (new) ----- */}
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Explore Services
          </Typography>
          <Button component={RouterLink} to="/services" variant="outlined" size="small">
            View all
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>
            No services to show yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((s) => (
              <Grid key={s._id} item xs={12} sm={6} md={4} lg={3}>
                <ServiceCard service={s} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default Home;
