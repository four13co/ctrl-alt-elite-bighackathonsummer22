import { AppType } from '@/enums/app-type.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAppDto {
  @IsString()
  public name: string;

  @IsEnum(AppType)
  public type: AppType;

  @IsNotEmpty()
  public apiKey: object;
}


export class CreateOrgAppDto {
  @IsString()
  public name: string;

  @IsEnum(AppType)
  public type: AppType;

  @IsNotEmpty()
  public apiKey: object;

  @IsNotEmpty()
  public userId: String;

  @IsNotEmpty()
  public orgId: String;
}
