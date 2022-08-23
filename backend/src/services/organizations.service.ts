import { CreateOrganizationDto } from '@/dtos/organization.dto';
import { BillingType } from '@/enums/billing-type.enum';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';

class OrganizationService {
  public organizations = organizationModel;

  public async findAllOrganizations(): Promise<Organization[]> {
    const organizations: Organization[] = await this.organizations.find();
    return organizations;
  }

  public async findOrganization(organizationId: string): Promise<Organization> {
    const organization: Organization = await this.organizations.findById(organizationId);
    return organization;
  }

  public async createOrganization(organizationData: CreateOrganizationDto): Promise<Organization> {
    const organization: Organization = await this.organizations.create({
      ...organizationData,
      billing: {
        type: BillingType.Monthly,
        coupon: '',
      },
    });
    return organization;
  }

  public async deleteOrganization(organizationId: string): Promise<Organization> {
    const organization: Organization = await this.organizations.findByIdAndDelete(organizationId);

    return organization;
  }
}

export default OrganizationService;
