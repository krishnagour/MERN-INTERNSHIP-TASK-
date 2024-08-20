import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransactionBarChart = ({ month }) => {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchBarData = async () => {
      try {
        const { data } = await axios.get('/api/transactions/bar-chart', { params: { month } });
        setBarData(data);
      } catch (error) {
        console.error('Error fetching bar chart data:', error);
      }
    };

    fetchBarData();
  }, [month]);

  const data = {
    labels:barData &&  barData.map(d => d.range),
    datasets: [
      {
        label: 'Number of Items',
        data: barData.map(d => d.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h3>Bar Chart - Price Range Distribution for {month}</h3>
      <Bar data={data} options={{ responsive: true }} />
    </div>
  );
};

export default TransactionBarChart;
