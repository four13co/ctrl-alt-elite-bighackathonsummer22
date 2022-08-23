import { AppType } from '@/enums/app-type.enum';
import { App } from '@/interfaces/apps.interface';
import appModel from '@/models/apps.model';
import { Http } from '@apis/acumatica/utils/http';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { ObjectId } from 'mongoose';
import Encrypter from '@/utils/encrypter';

interface RefreshToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
}

interface ApiKeys {
  baseUrl: string;
  entity: string;
  apiVersion: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  token: RefreshToken;
}

class AcumaticaHelper {
  protected http: any;
  protected headers: any;
  protected config: any;
  protected apiKeys: ApiKeys;
  protected id: ObjectId;

  protected async initHelper(id: ObjectId): Promise<void> {
    const app: App = await appModel.findById(id);

    this.id = id;
    this.apiKeys = app.apiKey;
    this.config = {
      headers: { Authorization: `Bearer ${this.apiKeys.token.access_token}` },
    };

    this.http = new Http(this.apiKeys.baseUrl, this.config.headers);

    this.http.instance.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        console.log(error);
        const originalRequest = error.config;
        console.log('Acumatica API Error: ', error.response.status, error.response.statusText, error.response.config.url);
        if (error.response.status === 401) {
          await this.refreshToken(id);
          originalRequest.headers['Authorization'] = `Bearer ${this.apiKeys.token.access_token}`;
          return axios(originalRequest);
        }
        return Promise.reject(error);
      },
    );

    // await this.testToken();
  }

  protected formatUrl(url: string): string {
    // /entity/Default/20.200.001'
    return `/entity/${this.apiKeys.entity}/${this.apiKeys.apiVersion}${url}`;
  }

  private async refreshToken(id: ObjectId): Promise<void> {
    const encrypter = new Encrypter(process.env.ENCRYPT_SECRET);
    const password = encrypter.dencrypt(this.apiKeys.password);

    const data = {
      // grant_type: 'refresh_token',
      client_id: this.apiKeys.client_id,
      client_secret: this.apiKeys.client_secret,
      // refresh_token: this.apiKeys.token.refresh_token,
      // Change to resource owner flow
      grant_type: 'password',
      username: this.apiKeys.username,
      password: password,
      scope: 'api',
    };

    const body = new URLSearchParams();

    for (const key in data) {
      body.append(key, data[key]);
    }

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    await axios
      .post(this.apiKeys.baseUrl + '/identity/connect/token', body, config)
      .then(async (data: AxiosResponse) => {
        const token: RefreshToken = data.data;
        this.apiKeys.token.access_token = token.access_token;
        // this.apiKeys.token.refresh_token = token.refresh_token;
        this.apiKeys.token.expires_in = token.expires_in;
        // Update database with the new tokens
        console.log(`Acumatica retrieved new token: `, token);
        this.config = {
          headers: { Authorization: `Bearer ${token.access_token}` },
        };
        this.http = new Http(this.apiKeys.baseUrl, this.config.headers);
        await appModel.updateOne(
          { _id: id },
          {
            $set: {
              apiKey: this.apiKeys,
            },
          },
        );
      })
      .catch(async (reason: AxiosError) => {
        console.log(reason);
        console.log(`${reason.response?.status} ${reason.response?.statusText}: ${JSON.stringify(reason.response?.data)}`);
      });
  }
}

export default AcumaticaHelper;
