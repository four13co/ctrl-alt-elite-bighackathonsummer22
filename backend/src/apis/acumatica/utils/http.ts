import axios from 'axios';
import BaseHttp from '@utils/baseHttp';

const headers: Readonly<Record<string, string | boolean>> = {
  Accept: 'application/json',
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Credentials': true,
  'X-Requested-With': 'XMLHttpRequest',
};

// We can use the following function to inject the JWT token through an interceptor
// We get the `accessToken` from the localStorage that we set when we authenticate

// const injectToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
//   try {
//     const token = localStorage.getItem('accessToken');

//     if (token != null) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

export class Http extends BaseHttp {
  private baseURL: string;
  private headers: any;
  constructor(baseURL: string, headers: any) {
    super();
    this.baseURL = baseURL;
    this.headers = headers;
    this.http = this.instance != null ? this.instance : this.initHttp();
  }

  initHttp() {
    const http = axios.create({
      baseURL: this.baseURL,
      headers: this.headers,
      withCredentials: true,
      timeout: 100000,
    });

    //http.interceptors.request.use(injectToken, error => Promise.reject(error));

    // http.interceptors.response.use(
    //   response => response,
    //   error => {
    //     if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    //       console.log(`A timeout happend on url ${error.config.url}`);
    //       return Promise.reject(error.code);
    //     } else {
    //       const { response } = error;
    //       this.handleError(response);
    //     }
    //   },
    // );

    this.instance = http;
    return http;
  }
}
