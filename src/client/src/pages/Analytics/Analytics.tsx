import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsData {
  totalTransactions: number;
  averageTransactionValue: number;
  activeCustomers: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>('month');
  const [customerGrowth, setCustomerGrowth] = useState<ChartData | null>(null);
  const [pointsDistribution, setPointsDistribution] = useState<ChartData | null>(null);
  const [rewardAnalytics, setRewardAnalytics] = useState<ChartData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const [growthRes, pointsRes, rewardsRes, metricsRes] = await Promise.all([
        axios.get(`/api/analytics/customer-growth?timeframe=${timeframe}`),
        axios.get('/api/analytics/points-distribution'),
        axios.get(`/api/analytics/reward-analytics?timeframe=${timeframe}`),
        axios.get(`/api/analytics/engagement-metrics?timeframe=${timeframe}`),
      ]);

      // Process customer growth data
      const growthData = growthRes.data.data;
      setCustomerGrowth({
        labels: Object.keys(growthData),
        datasets: [
          {
            label: 'New Customers',
            data: Object.values(growthData),
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
          },
        ],
      });

      // Process points distribution data
      const pointsData = pointsRes.data.data.distribution;
      setPointsDistribution({
        labels: pointsData.map((bucket: any) => 
          bucket._id === 'Other' ? bucket._id : `${bucket._id[0]}-${bucket._id[1]}`
        ),
        datasets: [
          {
            label: 'Number of Customers',
            data: pointsData.map((bucket: any) => bucket.count),
            backgroundColor: [
              '#2196f3',
              '#4caf50',
              '#ff9800',
              '#f44336',
              '#9c27b0',
              '#795548',
            ],
          },
        ],
      });

      // Process reward analytics data
      const rewardsData = rewardsRes.data.data;
      setRewardAnalytics({
        labels: Object.keys(rewardsData).map(key => rewardsData[key].name),
        datasets: [
          {
            label: 'Redemption Count',
            data: Object.values(rewardsData).map((reward: any) => reward.count),
            backgroundColor: 'rgba(33, 150, 243, 0.6)',
          },
        ],
      });

      // Set metrics
      setMetrics(metricsRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Total Transactions
            </Typography>
            <Typography variant="h4">
              {metrics?.totalTransactions.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Average Transaction Value
            </Typography>
            <Typography variant="h4">
              {metrics?.averageTransactionValue.toFixed(0)} points
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Active Customers
            </Typography>
            <Typography variant="h4">
              {metrics?.activeCustomers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Growth
            </Typography>
            {customerGrowth && (
              <Line
                data={customerGrowth}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Points Distribution
            </Typography>
            {pointsDistribution && (
              <Pie
                data={pointsDistribution}
                options={{
                  responsive: true,
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular Rewards
            </Typography>
            {rewardAnalytics && (
              <Bar
                data={rewardAnalytics}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics; 