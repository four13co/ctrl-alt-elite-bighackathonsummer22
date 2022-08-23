import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import { App } from '@/interfaces/apps.interface';
import { ObjectId } from 'mongoose';
class OrganizationAppsService {
    public orgApps: any = organizationModel

    public async getAllOrgApps(userId: String): Promise<any[]> {
        const orgApps: any[] = await this.orgApps.find({ users: userId }).populate('apps')
        return orgApps;
    }

    public async updateOrgApp(userId: String, orgId: String, newApp: App): Promise<Organization[]> {
        const orgAppsUpdate: any = await this.orgApps.updateOne({ _id: orgId }, { $push: { 'apps': newApp } }, { new: true });
        const updatedOrgApps: Organization[] = await this.orgApps.find({ users: userId }).populate('apps')

        return updatedOrgApps;
    }

    public async deleteOrgApp(userId: String, orgId: String, removeApp: App): Promise<Organization[]> {
        const orgAppsUpdate: any = await this.orgApps.updateOne({ _id: orgId }, { $pull: { 'apps': removeApp._id } });
        const updatedOrgApps: Organization[] = await this.orgApps.find({ users: userId }).populate('apps')

        return updatedOrgApps;
    }

}

export default OrganizationAppsService;