import { v4 as uuid } from 'uuid';
import { AppType } from '@/enums/app-type.enum';
import organizationModel from '@/models/organizations.model';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import { Organization } from '@/interfaces/organizations.interface';

class ShopifyAcumaticaService {
  private appName: string;
  public organization: Organization;

  /**
   *
   * @param appName target organization name
   */
  constructor(appName: string) {
    this.appName = appName;
  }

  /**
   *
   * @param inventoryId stock invetory id from accumatica
   */
  public async duplicateCrossReferencesByAlternateId(inventoryId: string) {
    let acumaticaProduct: any;

    try {
      let hasChanges = false;

      if (!this.organization) {
        this.organization = await organizationModel.findOne({ name: this.appName }).populate('apps');
      }

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(this.organization.apps.find(ii => ii.type == AppType.Acumatica)._id);

      const acumaticaParams = `?$expand=crossreferences&$select=InventoryID,ExportToExternal,crossreferences/alternateid,crossreferences/alternatetype`;
      acumaticaProduct = await acumaticaWrapper.getProduct(`${inventoryId}${acumaticaParams}`);

      if (!acumaticaProduct?.ExportToExternal?.value) {
        return null;
      }

      acumaticaProduct?.CrossReferences.forEach(data => {
        const alternateIdValue = data?.AlternateID?.value?.replace(/\s/g, '');

        if (data?.AlternateType?.value !== 'Global') {
          const isDuplicated = acumaticaProduct?.CrossReferences.some(
            i => i?.AlternateID?.value.replace(/\s/g, '') === alternateIdValue && i.AlternateType?.value === 'Global',
          );

          if (!isDuplicated) {
            acumaticaProduct.CrossReferences.push({
              AlternateID: {
                value: alternateIdValue,
              },
              AlternateType: {
                value: 'Global',
              },
            });

            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        await acumaticaWrapper.UpdateProduct({ ...acumaticaProduct });
      }
    } catch (error) {
      console.log('#### ERROR: ', error.message);
    }

    return acumaticaProduct;
  }

  public async duplicateCrossReferencesOfAllInventoriesInAcumatica() {
    if (!this.organization) {
      this.organization = await organizationModel.findOne({ name: this.appName }).populate('apps');
    }

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(this.organization.apps.find(ii => ii.type == AppType.Acumatica)._id);

    const inventories = await acumaticaWrapper.getProducts(`?$expand=crossreferences&$select=InventoryID,ExportToExternal`);

    for (let x = 0; x < inventories.length; x++) {
      const inventory = inventories[x];
      const inventoryId = inventory?.InventoryID?.value;

      if (inventoryId && inventory?.ExportToExternal?.value) {
        await this.duplicateCrossReferencesByAlternateId(inventoryId);
      }
    }
  }

  public async getAllSyncCrossReferenceData() {
    if (!this.organization) {
      this.organization = await organizationModel.findOne({ name: this.appName }).populate('apps');
    }

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(this.organization.apps.find(ii => ii.type == AppType.Acumatica)._id);

    const inventories = await acumaticaWrapper.getProducts(`?$expand=crossreferences&$select=InventoryID,ExportToExternal`);

    return inventories;
  }
}

export default ShopifyAcumaticaService;
