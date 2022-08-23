import { IsString } from 'class-validator';

export class CreateOrganizationsDto {
  @IsString()
  public name: String;
}
