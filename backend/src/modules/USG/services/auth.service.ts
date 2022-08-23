import fetch, { RequestInit, Headers } from 'node-fetch';
class AuthService {
  public async listrakFetch() {
    const requestURL = process.env.USG_LISTRAK_ENDPOINT;
    const fetchHeaders = new Headers();

    fetchHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'client_credentials');
    urlencoded.append('client_id', process.env.USG_LISTRAK_CLIENT_ID);
    urlencoded.append('client_secret', process.env.USG_LISTRAK_CLIENT_SECRET);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: fetchHeaders,
      body: urlencoded,
    };

    const response = await fetch(requestURL, requestOptions);

    return await response.json();
  }
}

export default AuthService;
