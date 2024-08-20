import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionStats = ({ month }) => {
  const [stats, setStats] = useState({ totalAmount: 0, totalSoldItems: 0, totalNotSoldItems: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/transactions/statistics', { params: { month } });
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, [month]);

  return (
    <div>
      <h3>Statistics for {month}</h3>
      <p>Total Sales Amount: ${stats.totalAmount}</p>
      <p>Total Sold Items: {stats.totalSoldItems}</p>
      <p>Total Not Sold Items: {stats.totalNotSoldItems}</p>
    </div>
  );
};

export default TransactionStats;
