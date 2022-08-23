import { TriggerType } from '@/enums/trigger-type.enum';
import { Organization } from '@/interfaces/organizations.interface';
import { IsString, IsEnum } from 'class-validator';

export class CreateTriggerDto {
  @IsString()
  public name: string;

  @IsEnum(TriggerType)
  public type: TriggerType;

  @IsString()
  public trigger: string;

  @IsString()
  public job: string;

  public organization: Organization;
}
