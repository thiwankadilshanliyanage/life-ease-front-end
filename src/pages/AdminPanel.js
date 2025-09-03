import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Chip, Table, TableHead, TableRow,
  TableCell, TableBody, Button, CircularProgress, Snackbar, Alert,
  Grid, TextField, Pagination, IconButton, InputAdornment, Divider, Tooltip, Skeleton,
  useTheme
} from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BlockIcon from '@mui/icons-material/Block';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {
  listProviders,
  approveProvider,
  rejectProvider,
  getAdminStats,
  listUsersAdmin
} from '../services/api';

const StatusChip = ({ s }) => {
  if (s === 'approved') return <Chip label="Approved" color="success" size="small" variant="filled" icon={<TaskAltIcon />} />;
  if (s === 'rejected') return <Chip label="Rejected" color="error" size="small" variant="filled" icon={<BlockIcon />} />;
  return <Chip label="Pending" color="warning" size="small" variant="filled" icon={<PendingActionsIcon />} />;
};

const makeGradient = (theme, base) => {
  const isDark = theme.palette.mode === 'dark';
  const c1 = isDark ? lighten(base, 0.1) : darken(base, 0.02);
  const c2 = isDark ? darken(base, 0.2) : darken(base, 0.15);
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
};

const StatCard = ({ title, value, icon, gradient }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      background: gradient,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', right: -24, top: -24, opacity: 0.15, transform: 'rotate(15deg)', color: 'white' }}>
      {icon}
    </Box>
    <Typography variant="subtitle2" sx={{ opacity: 0.95 }}>{title}</Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, mt: 0.5 }}>{value}</Typography>
  </Paper>
);

export default function AdminPanel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState('pending'); // pending|approved|rejected|all|users
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState(''); // '', 'user', 'service_provider', 'admin'

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const token = useMemo(() => localStorage.getItem('token'), []);
  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  // Header theming
  const heroBg = useMemo(() => {
    const base = theme.palette.primary.main;
    return makeGradient(theme, base);
  }, [theme]);

  const heroOverlay = useMemo(
    () => alpha(theme.palette.common.white, isDark ? 0.12 : 0.18),
    [theme, isDark]
  );

  // Card gradients
  const gUsers     = useMemo(() => makeGradient(theme, theme.palette.success.main), [theme]);
  const gProviders = useMemo(() => makeGradient(theme, theme.palette.secondary.main), [theme]);
  const gPending   = useMemo(() => makeGradient(theme, theme.palette.warning.main), [theme]);
  const gApproved  = useMemo(() => makeGradient(theme, theme.palette.info.main), [theme]);
  const gRejected  = useMemo(() => makeGradient(theme, theme.palette.error.main), [theme]);

  // Surfaces / papers
  const surface = useMemo(
    () => (isDark ? alpha('#0b1220', 0.7) : theme.palette.background.paper),
    [isDark, theme]
  );
  const cardShadow = isDark
    ? '0 10px 30px rgba(0,0,0,0.35)'
    : '0 10px 25px rgba(2,6,23,0.08)';

  // Fetch stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await getAdminStats(token);
      setStats(res.data);
    } catch (e) {
      setSnack({ open: true, message: e.response?.data?.message || 'Failed to load stats', severity: 'error' });
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch providers
  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const filter = tab === 'all' ? undefined : (['pending', 'approved', 'rejected'].includes(tab) ? tab : undefined);
      const res = await listProviders(token, filter);
      setProviders(res.data.providers || []);
    } catch (e) {
      setSnack({ open: true, message: e.response?.data?.message || 'Failed to load providers', severity: 'error' });
    } finally {
      setLoadingProviders(false);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await listUsersAdmin(token, {
        page,
        limit: 10,
        search: usersSearch || undefined,
        role: usersRole || undefined
      });
      setUsers(res.data.items || []);
      setUsersPage(res.data.pagination?.page || 1);
      setUsersPages(res.data.pagination?.pages || 1);
    } catch (e) {
      setSnack({ open: true, message: e.response?.data?.message || 'Failed to load users', severity: 'error' });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []); // once

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers(1);
    } else {
      fetchProviders();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleApprove = async (id) => {
    try {
      await approveProvider(token, id);
      setSnack({ open: true, message: 'Approved successfully', severity: 'success' });
      fetchProviders(); fetchStats();
    } catch (e) {
      setSnack({ open: true, message: e.response?.data?.message || 'Approve failed', severity: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectProvider(token, id);
      setSnack({ open: true, message: 'Rejected successfully', severity: 'info' });
      fetchProviders(); fetchStats();
    } catch (e) {
      setSnack({ open: true, message: e.response?.data?.message || 'Reject failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero / Header */}
      <Box
        sx={{
          px: { xs: 2, md: 3 }, pt: { xs: 10, md: 12 }, pb: 4,
          background: heroBg,
          color: 'white',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute', inset: 0, background: heroOverlay
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: 0.3 }}>
            Admin Panel
          </Typography>
          <Typography sx={{ opacity: 0.95, mb: 3, maxWidth: 700 }}>
            Review providers, manage users, and track platform activity — your controls adapt to light or dark mode.
          </Typography>

          {/* Stats Row */}
          <Grid container spacing={2}>
            {loadingStats || !stats ? (
              <>
                <Grid item xs={12} sm={6} md={3}><Skeleton variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: alpha('#fff', 0.25) }} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Skeleton variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: alpha('#fff', 0.25) }} /></Grid>
                <Grid item xs={12} sm={4} md={2}><Skeleton variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: alpha('#fff', 0.25) }} /></Grid>
                <Grid item xs={12} sm={4} md={2}><Skeleton variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: alpha('#fff', 0.25) }} /></Grid>
                <Grid item xs={12} sm={4} md={2}><Skeleton variant="rounded" height={96} sx={{ borderRadius: 3, bgcolor: alpha('#fff', 0.25) }} /></Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<GroupIcon sx={{ fontSize: 120 }} />}
                    gradient={gUsers}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Providers"
                    value={stats.totalProviders}
                    icon={<WorkspacePremiumIcon sx={{ fontSize: 120 }} />}
                    gradient={gProviders}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <StatCard
                    title="Pending"
                    value={stats.providersByStatus?.pending || 0}
                    icon={<PendingActionsIcon sx={{ fontSize: 120 }} />}
                    gradient={gPending}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <StatCard
                    title="Approved"
                    value={stats.providersByStatus?.approved || 0}
                    icon={<TaskAltIcon sx={{ fontSize: 120 }} />}
                    gradient={gApproved}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <StatCard
                    title="Rejected"
                    value={stats.providersByStatus?.rejected || 0}
                    icon={<BlockIcon sx={{ fontSize: 120 }} />}
                    gradient={gRejected}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, md: 3 }, mt: -6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: surface,
            boxShadow: cardShadow,
            backdropFilter: isDark ? 'saturate(140%) blur(8px)' : 'none',
            border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.4 : 0.15)}`
          }}
        >
          {/* Tabs + top actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '.MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                '.MuiTabs-indicator': { height: 3, borderRadius: 3 },
                mb: { xs: 1, md: 0 },
              }}
            >
              <Tab label="Pending Providers" value="pending" />
              <Tab label="Approved Providers" value="approved" />
              <Tab label="Rejected Providers" value="rejected" />
              <Tab label="All Providers" value="all" />
              <Tab label="Users" value="users" iconPosition="start" icon={<QueryStatsIcon />} />
            </Tabs>

            <Box sx={{ flex: 1 }} />
            <Tooltip title="Refresh">
              <IconButton onClick={() => (tab === 'users' ? fetchUsers(usersPage) : fetchProviders())}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* CONTENT: USERS or PROVIDERS */}
          {tab === 'users' ? (
            <>
              {/* Users Filters */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 220px auto',
                  gap: 1,
                  mb: 2,
                  alignItems: 'center',
                  '@media (max-width:900px)': {
                    gridTemplateColumns: '1fr',
                  }
                }}
              >
                <TextField
                  placeholder="Search name or email…"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><SearchIcon /></InputAdornment>
                    )
                  }}
                />
                <TextField
                  placeholder="Role (user / service_provider / admin)"
                  value={usersRole}
                  onChange={(e) => setUsersRole(e.target.value)}
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={() => fetchUsers(1)}>Apply</Button>
                  <Button variant="text" onClick={() => { setUsersSearch(''); setUsersRole(''); fetchUsers(1); }}>Clear</Button>
                </Box>
              </Box>

              {/* Users Table */}
              {usersLoading ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : users.length === 0 ? (
                <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>No users found.</Typography>
              ) : (
                <>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Provider Status</TableCell>
                          <TableCell>Joined</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u._id} hover>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                              {u.role === 'service_provider'
                                ? <StatusChip s={u.serviceProviderProfile?.approvalStatus} />
                                : '-'}
                            </TableCell>
                            <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      page={usersPage}
                      count={usersPages}
                      onChange={(_, p) => fetchUsers(p)}
                    />
                  </Box>
                </>
              )}
            </>
          ) : (
            <>
              {/* Providers Table (with inline actions) */}
              {loadingProviders ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : providers.length === 0 ? (
                <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>No providers for this filter.</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Provider</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>License</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {providers.map((u) => (
                        <TableRow key={u._id} hover>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.serviceProviderProfile?.companyName || '-'}</TableCell>
                          <TableCell>{u.serviceProviderProfile?.businessLicenseNumber || '-'}</TableCell>
                          <TableCell><StatusChip s={u.serviceProviderProfile?.approvalStatus} /></TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            <Tooltip title="Approve">
                              <span>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApprove(u._id)}
                                  disabled={u.serviceProviderProfile?.approvalStatus === 'approved'}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleReject(u._id)}
                                  disabled={u.serviceProviderProfile?.approvalStatus === 'rejected'}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
