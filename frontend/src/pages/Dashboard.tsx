import React from 'react';
import { Container } from 'react-bootstrap';

const Dashboard: React.FC = () => {
  const userId = localStorage.getItem('userId');
  return (
    <Container className="py-4">
      <h1 className="h4 mb-3">Dashboard</h1>
      <p className="text-muted">{userId ? `User ID: ${userId}` : 'Welcome.'}</p>
    </Container>
  );
};

export default Dashboard;
