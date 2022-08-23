import axios from 'axios';
import BaseHttp from '@utils/baseHttp';

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

    this.instance = http;
    return http;
  }
}
