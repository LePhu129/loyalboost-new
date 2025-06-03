import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid as MuiGrid,
  Typography,
  LinearProgress,
} from '@mui/material';
import { RootState } from '@/store';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  const getTierProgress = () => {
    const tiers = {
      Bronze: { min: 0, max: 1000 },
      Silver: { min: 1000, max: 5000 },
      Gold: { min: 5000, max: 10000 },
      Platinum: { min: 10000, max: 25000 },
    };

    const currentTier = user?.membershipTier || 'Bronze';
    const points = user?.totalPoints || 0;
    const { min, max } = tiers[currentTier as keyof typeof tiers];
    const progress = ((points - min) / (max - min)) * 100;

    return {
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNext: max - points,
      nextTier:
        currentTier === 'Platinum'
          ? null
          : Object.keys(tiers)[
              Object.keys(tiers).indexOf(currentTier) + 1
            ],
    };
  };

  const { progress, pointsToNext, nextTier } = getTierProgress();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <MuiGrid container spacing={3}>
        <MuiGrid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Membership Status
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {user?.membershipTier}
              </Typography>
              {nextTier && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={progress} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {pointsToNext} points until {nextTier}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </MuiGrid>
        <MuiGrid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Points
              </Typography>
              <Typography variant="h4" color="primary">
                {user?.totalPoints || 0}
              </Typography>
            </CardContent>
          </Card>
        </MuiGrid>
      </MuiGrid>
    </Box>
  );
} 