import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + N: New Trade
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/trades/new');
      }

      // Ctrl/Cmd + T: Go to Trades
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        navigate('/trades');
      }

      // Ctrl/Cmd + D: Go to Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }

      // Ctrl/Cmd + A: Go to Analytics
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        navigate('/analytics');
      }

      // Escape: Go back to dashboard
      if (e.key === 'Escape') {
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
};

export default useKeyboardShortcuts;