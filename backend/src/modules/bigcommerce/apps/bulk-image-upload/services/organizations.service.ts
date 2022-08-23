import { CreateOrganizationsDto } from '../dtos/organizations.dto';
import { Organizations } from '../interfaces/organizations.interface';
import Database from '../databases';

class OrganizationsService {
  public db = new Database();

  public async findOrganizations(params: object = {}): Promise<Organizations[]> {
    try {
      await this.db.init();
      const org: Organizations[] = await this.db.organizationsModel.find(params);
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findOrganization(storeId: string): Promise<Organizations> {
    try {
      await this.db.init();
      const org: Organizations = await this.db.organizationsModel.findById(storeId);
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findOrganizationsByStoreHash(storeHash: string): Promise<Organizations> {
    try {
      await this.db.init();
      const org: Organizations = await this.db.organizationsModel.findOne({ storeHash: storeHash });
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async createOrganizations(organizationsData: CreateOrganizationsDto): Promise<Organizations> {
    try {
      await this.db.init();
      const org: Organizations = await this.db.organizationsModel.create(organizationsData);
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async updateOrganization(storeId: string, storeData: CreateOrganizationsDto): Promise<Organizations> {
    try {
      await this.db.init();
      const org: Organizations = await this.db.organizationsModel.findByIdAndUpdate(storeId, storeData);
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async deleteOrganization(storeId: string): Promise<Organizations> {
    try {
      await this.db.init();
      const org: Organizations = await this.db.organizationsModel.findByIdAndDelete(storeId);
      return org;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }
}

export default OrganizationsService;
