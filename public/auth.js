var auth0 = new auth0.WebAuth({
  domain: 'metaarcadeclub.uk.auth0.com',
  clientID: 'Y7GXtr7l6VeqfzTrhHdSEbm4ZnFzpE0v',
  redirectUri: '/callback',
  responseType: 'token id_token',
  scope: 'openid profile',
  leeway: 60,
  cacheLocation: 'memory'  // Avoids local storage and keeps tokens in memory
});

// Example Authentication Success Handling
auth0.parseHash((err, authResult) => {
  if (authResult && authResult.accessToken && authResult.idToken) {
    window.location.hash = '';
    auth0.client.userInfo(authResult.accessToken, (err, user) => {
      if (user) {
        // Here, instead of using local storage, you might consider setting a secure, HttpOnly cookie via a server-side endpoint
        console.log('User info retrieved', user);
        // Example: POST to a server endpoint that sets cookies
        fetch('/set-user-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auth0_id: user.sub }),
          credentials: 'include' // Ensures cookies are included in the request
        })
        .then(response => response.json())
        .then(data => console.log('Session setup response:', data))
        .catch(error => console.error('Error setting session:', error));
      }
    });
  } else if (err) {
    console.error('Error parsing the authentication hash:', err);
  }
});
