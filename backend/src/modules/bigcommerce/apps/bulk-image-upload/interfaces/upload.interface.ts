import { Request } from 'express';

export interface RequestWithFiles extends Request {
  files: any;
}
