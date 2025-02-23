import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { SessionContext } from '../SessionContext';

export const useSessionNavigation = () => {
  const navigate = useNavigate();
  const { client, loggedIn } = useContext(SessionContext);

  useEffect(() => {
    if (client) {
      client.onSessionExpired = () => {
        navigate('/login', {
          state: { sessionExpired: true },
          replace: true
        });
      };
    }
  }, [navigate, client]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (loggedIn === false) {
      navigate('/login', { replace: true });
    }
  }, [loggedIn, navigate]);
};