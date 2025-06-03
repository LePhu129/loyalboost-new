import { useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import Barcode from 'react-barcode';
import { RootState } from '@/store';

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1">
          Please log in to view your profile.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {user.email}
              </Typography>
              {user.phoneNumber && (
                <Typography variant="body1">
                  <strong>Phone:</strong> {user.phoneNumber}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Membership Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Membership Information
              </Typography>
              <Typography variant="body1">
                <strong>Membership Tier:</strong> {user.membershipTier}
              </Typography>
              <Typography variant="body1">
                <strong>Total Points:</strong> {user.totalPoints}
              </Typography>
              <Typography variant="body1">
                <strong>Member Since:</strong>{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Barcode */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Membership Barcode
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                {user.barcode && (
                  <div>
                    <Barcode 
                      value={user.barcode}
                      width={1.5}
                      height={100}
                      fontSize={16}
                      displayValue={true}
                    />
                  </div>
                )}
              </Box>
              <Typography variant="body2" align="center" color="text.secondary">
                Show this barcode when making purchases to earn points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 