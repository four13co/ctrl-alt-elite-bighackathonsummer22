import { IsString } from 'class-validator';
import { User } from '@/interfaces/users.interface';

export class CreateOrganizationDto {
  @IsString()
  public name: string;

  public users: User[];
}
