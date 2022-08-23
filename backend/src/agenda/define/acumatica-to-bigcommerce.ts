import AcumaticaWrapper from '@/apis/acumatica/acumatica-wrapper';
import { Product as AcumaticaProduct } from '@/apis/acumatica/interfaces/products.interface';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import { Product as BigCommerceProduct } from '@/apis/bigcommerce/interfaces/products.interface';
import { AppType } from '@/enums/app-type.enum';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { Agenda, Job } from 'agenda/dist';

export default function (agenda: Agenda) {
  agenda.define('acumatica-to-bigcommerce', async (job: Job) => {
    const { organizationId } = job.attrs.data;

    const defaultOrg: Organization = await organizationModel.findById(organizationId).populate('apps');

    const acumatica = new AcumaticaWrapper();
    acumatica.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

    const bigcommerce = new BigcommerceWrapper();
    bigcommerce.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    for (const product of await acumatica.getProducts()) {
      console.log(product);
      // const acProduct: AcumaticaProduct = product;

      // const bcProduct: BigCommerceProduct = {
      //   name: acProduct.Attributes[0].
      // }

      // bigcommerce.createProduct(bcProduct);
      break;
    }
  });
}
