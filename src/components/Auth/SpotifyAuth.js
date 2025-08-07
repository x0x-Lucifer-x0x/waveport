const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI || (window.location.origin + '/spotify-callback');

const scopes = [
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read',
  'user-library-modify',
];
  
function generateCodeVerifier() {
  const array = new Uint8Array(128);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function saveVerifier(verifier) {
  sessionStorage.setItem('spotifyCodeVerifier', verifier);
}

export async function startSpotifyAuth(onTokenReceived) {
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

  const width = 500;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'SpotifyAuth',
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=yes,status=no`
  );

  if (popup) {
    const pollTimer = window.setInterval(async () => {
      try {
        if (!popup || popup.closed) {
          window.clearInterval(pollTimer);
          console.log('Auth popup closed by user');
          return;
        }
        if (popup.location.href.indexOf(redirectUri) === 0) {
          const urlParams = new URLSearchParams(popup.location.search);
          const code = urlParams.get('code');
          if (code) {
            window.clearInterval(pollTimer);
            popup.close();

            const tokenData = await fetchSpotifyToken(code);

            if (onTokenReceived && typeof onTokenReceived === 'function') {
              onTokenReceived(tokenData);
            }
          }
        }
      } catch (err) {
        // Ignore cross-origin errors until redirect happens
      }
    }, 500);
  } else {
    alert('Failed to open authentication popup. Please allow popups for this site.');
  }
}

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

  data.expires_at = Date.now() + (data.expires_in * 1000);

  return data;
}
