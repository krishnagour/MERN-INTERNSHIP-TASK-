import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionPieChart = ({ month }) => {
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const { data } = await axios.get('/api/transactions/pie-chart', { params: { month } });
        setPieData(data);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };

    fetchPieData();
  }, [month]);

  const data = {
    labels: pieData.map(d => d._id),
    datasets: [
      {
        label: 'Number of Items by Category',
        data: pieData.map(d => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h3>Pie Chart - Item Distribution by Category for {month}</h3>
      <Pie data={data} options={{ responsive: true }} />
    </div>
  );
};

export default TransactionPieChart;
