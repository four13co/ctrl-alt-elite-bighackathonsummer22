import { IsString } from 'class-validator';

export class CreateVerifyDto {
@IsString()
  public payload: string;
}
