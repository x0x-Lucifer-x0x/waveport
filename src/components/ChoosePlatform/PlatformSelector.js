import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { startSpotifyAuth, fetchSpotifyToken } from '../Auth/SpotifyAuth';
import './PlatformSelector.css';

function PlatformSelector({ title, onSelect, showBack }) {
  const navigate = useNavigate();
  const { setSpotifyToken } = useContext(AuthContext);

  // Handle Spotify OAuth callback on mount (if URL contains code)
  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const tokenData = await fetchSpotifyToken(code);
          setSpotifyToken(tokenData);
          window.history.replaceState({}, document.title, window.location.pathname);
          // navigate('/select-destination'); // or keep user on current page as needed
        } catch (err) {
          console.error('Spotify token exchange failed:', err);
        }
      }
    }

    handleCallback();
  }, [setSpotifyToken]);

  // Click handler for Spotify button with integrated auth-check and OAuth start
  const handleSpotifyClick = () => {
    startSpotifyAuth((tokenData) => {
      setSpotifyToken(tokenData);
      console.log('Token received, navigating...');     // save token in context/state
      navigate('/select-destination'); // navigate to next page
    });
  };

  // Handler for YouTube Music click - as usual (calls passed onSelect handler)
  const handleYouTubeClick = () => {
    onSelect('youtube');
  };

  const platforms = [
    {
      name: 'Spotify',
      id: 'spotify',
      logo: '/spotify.png',
      onClick: handleSpotifyClick,
    },
    {
      name: 'Youtube Music',
      id: 'youtube',
      logo: '/youtubeMusic.png',
      onClick: handleYouTubeClick,
    },
  ];

  return (
    <>
      {showBack && (
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr;
        </button>
      )}
      <div id="platform-selector-container">
        <h2>{title}</h2>
        <div className="button-wrapper">
          {platforms.map(({ id, logo, name, onClick }) => (
            <button
              key={id}
              className={`platform-button ${id}`}
              onClick={onClick}
            >
              <span className="logo-placeholder">
                <img src={logo} alt={`${name} logo`} className="platform-logo" />
              </span>
              {name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default PlatformSelector;
