import React, { createContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [youtubeToken, setYoutubeToken] = useState(null);

  // Load tokens from sessionStorage on mount
  useEffect(() => {
    const sp = sessionStorage.getItem('spotifyAuth');
    if (sp) setSpotifyToken(JSON.parse(sp));

    const yt = sessionStorage.getItem('youtubeAuth');
    if (yt) setYoutubeToken(JSON.parse(yt));
  }, []);

  // When spotifyToken changes, update sessionStorage
  useEffect(() => {
    if (spotifyToken) {
      sessionStorage.setItem('spotifyAuth', JSON.stringify(spotifyToken));
    } else {
      sessionStorage.removeItem('spotifyAuth');
    }
  }, [spotifyToken]);

  // When youtubeToken changes, update sessionStorage
  useEffect(() => {
    if (youtubeToken) {
      sessionStorage.setItem('youtubeAuth', JSON.stringify(youtubeToken));
    } else {
      sessionStorage.removeItem('youtubeAuth');
    }
  }, [youtubeToken]);

  // Simple method to check if token is valid (non-expired)
  // You might store expires_at timestamp in token object
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    if (!token.expires_at) return true; // if no expiry info, assume valid
    return Date.now() < token.expires_at;
  }, []);

  // Helpers to check if auth ready:
  const isSpotifyAuthenticated = isTokenValid(spotifyToken);
  const isYoutubeAuthenticated = isTokenValid(youtubeToken);

  return (
    <AuthContext.Provider value={{
      spotifyToken, setSpotifyToken,
      youtubeToken, setYoutubeToken,
      isSpotifyAuthenticated,
      isYoutubeAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
