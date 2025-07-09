import React from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'react-slick';

import slide1 from '../assets/slider1.jpg';
import slide2 from '../assets/slider2.jpg';
import slide3 from '../assets/slider3.jpg';

const Home = () => {
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

  return (
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
  );
};

export default Home;
