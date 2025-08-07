// spotifyAuth.js (helper functions for PKCE)

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI || (window.location.origin + '/spotify-callback'); // configure this in your Spotify dev console

const scopes = [
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read',
  'user-library-modify',
];

// Generate a random string for PKCE code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(128);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate code challenge from verifier (SHA-256 base64url)
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Save verifier for later code exchange
function saveVerifier(verifier) {
  sessionStorage.setItem('spotifyCodeVerifier', verifier);
}

// Step 1: Redirect user to Spotify authorization URL
export async function startSpotifyAuth() {
  const codeVerifier = generateCodeVerifier();
  saveVerifier(codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl = 'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge_method=S256` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}`;

  window.location = authUrl; // redirects user
}

// Step 2: After redirect, exchange code for token
export async function fetchSpotifyToken(code) {
  const verifier = sessionStorage.getItem('spotifyCodeVerifier');

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!resp.ok) throw new Error('Token exchange failed');

  const data = await resp.json();

  // Calculate expiry timestamp ms
  data.expires_at = Date.now() + (data.expires_in * 1000);

  return data; // { access_token, token_type, expires_in, refresh_token, scope, expires_at }
}
