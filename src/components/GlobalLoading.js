// src/components/GlobalLoading.jsx
import React, { useEffect, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { subscribe } from '../utils/loadingBus';

export default function GlobalLoading() {
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const unsub = subscribe(setActiveRequests);
    return () => unsub();
  }, []);

  const open = activeRequests > 0;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (t) => t.zIndex.modal + 1,
        color: '#fff',
        backdropFilter: 'blur(2px)',
      }}
    >
      <CircularProgress thickness={4} />
    </Backdrop>
  );
}
