import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionTable = ({ month }) => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get('/api/transactions', {
          params: { month, search, page, perPage }
        });
        setTransactions(data.transactions);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [month, search, page, perPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / perPage)) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.product.title}</td>
              <td>{transaction.product.description}</td>
              <td>{transaction.product.price}</td>
              <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>Previous</button>
        <span>Page {page} of {Math.ceil(total / perPage)}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(total / perPage)}>Next</button>
      </div>
    </div>
  );
};

export default TransactionTable;
