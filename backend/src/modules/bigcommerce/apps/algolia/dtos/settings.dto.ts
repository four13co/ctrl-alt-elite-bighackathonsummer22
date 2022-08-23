import { IsObject } from 'class-validator';

export class CreateSettingDto {
  @IsObject()
  public account: object;

  @IsObject()
  public setting: object;

  @IsObject()
  public styling: object;
}
