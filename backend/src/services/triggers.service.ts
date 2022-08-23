import { CreateTriggerDto } from '@/dtos/triggers.dto';
import { Organization } from '@/interfaces/organizations.interface';
import { Trigger } from '@/interfaces/triggers.model';
import organizationsModel from '@/models/organizations.model';
import triggerModel from '@/models/triggers.model';

class TriggerService {
  public triggers = triggerModel;
  public organizations = organizationsModel;

  public async findAllTriggers(): Promise<Trigger[]> {
    const triggers: Trigger[] = await this.triggers.find();
    return triggers;
  }

  public async findTrigger(triggerId: string): Promise<Trigger> {
    const trigger: Trigger = await this.triggers.findById(triggerId);
    return trigger;
  }

  public async createTrigger(organizationId: string, triggerData: CreateTriggerDto): Promise<Trigger> {
    const organization: Organization = await this.organizations.findById(organizationId);
    if (!organization) {
      throw new Error(`Could not find organization ${organizationId}`);
    }

    triggerData.organization = organization;

    const trigger: Trigger = await this.triggers.create(triggerData);
    return trigger;
  }

  public async updateTrigger(triggerId: string, triggerData: CreateTriggerDto): Promise<Trigger> {
    const trigger: Trigger = await this.triggers.findByIdAndUpdate(triggerId, triggerData);
    return trigger;
  }

  public async deleteTrigger(triggerId: string): Promise<Trigger> {
    const trigger: Trigger = await this.triggers.findByIdAndDelete(triggerId);
    return trigger;
  }
}

export default TriggerService;
