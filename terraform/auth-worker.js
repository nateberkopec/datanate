export default {
  async fetch(request, env, ctx) {
    // Get auth credentials from environment
    const expectedUsername = env.AUTH_USERNAME;
    const expectedPassword = env.AUTH_PASSWORD;
    
    // Parse Authorization header
    const authorization = request.headers.get('Authorization');
    
    if (!authorization) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Datanate Dashboard"',
        },
      });
    }
    
    // Decode basic auth
    const [scheme, encoded] = authorization.split(' ');
    
    if (!encoded || scheme !== 'Basic') {
      return new Response('Invalid authentication', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Datanate Dashboard"',
        },
      });
    }
    
    const decoded = atob(encoded);
    const [username, password] = decoded.split(':');
    
    // Verify credentials
    if (username !== expectedUsername || password !== expectedPassword) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Datanate Dashboard"',
        },
      });
    }
    
    // Authentication successful, fetch the actual page
    return fetch(request);
  },
};