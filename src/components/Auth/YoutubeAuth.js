// youtubeAuth.js

const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const scope = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly';

export function loadGapi() {
  return new Promise((resolve, reject) => {
    if (window.gapi) resolve(window.gapi);
    else {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            clientId: clientId,
            scope: scope
          }).then(() => resolve(window.gapi))
            .catch((e) => reject(e));
        });
      };
      script.onerror = () => reject(new Error('Failed to load gapi script'));
      document.body.appendChild(script);
    }
  });
}

export async function signInYoutube() {
  const gapi = await loadGapi();
  const GoogleAuth = gapi.auth2.getAuthInstance();
  if (!GoogleAuth.isSignedIn.get()) {
    await GoogleAuth.signIn();
  }
  return GoogleAuth.currentUser.get().getAuthResponse(true);
}

export function signOutYoutube() {
  if (window.gapi && window.gapi.auth2) {
    const auth2 = window.gapi.auth2.getAuthInstance();
    if (auth2) auth2.signOut();
  }
}
