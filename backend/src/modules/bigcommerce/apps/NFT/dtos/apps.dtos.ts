import { AppType } from '@/enums/app-type.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAppDto {
  @IsString()
  public name: String;

  @IsEnum(AppType)
  public type: AppType;

  @IsNotEmpty()
  public apiKey: object;
}
