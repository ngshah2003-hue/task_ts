import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as kanbanApi from '../api/kanbanApi';

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      navigate('/dashboard', { replace: true });
      return;
    }
    kanbanApi
      .acceptInvite(token)
      .then((data) => {
        setStatus('done');
        toast.success('You have joined the board.');
        navigate(`/boards/${data.boardId}`, { replace: true });
      })
      .catch((err) => {
        setStatus('error');
        toast.error(kanbanApi.getApiError(err));
        navigate('/dashboard', { replace: true });
      });
  }, [token, navigate]);

  return (
    <Container className="py-5 text-center">
      {status === 'loading' && (
        <>
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Accepting invitation…</p>
        </>
      )}
    </Container>
  );
};

export default AcceptInvitePage;
