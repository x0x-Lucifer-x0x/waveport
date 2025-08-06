import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingPage.css';  // CSS for this component

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading wait and redirect
    const timer = setTimeout(() => {
      navigate('/select-source'); // Redirect to platform selector page
    }, 2000); // 2 seconds loading time (adjust as you like)

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <h2>Loading Waveport...</h2>
    </div>
  );
}

export default LoadingPage;
