import webhookLogModel from '@/models/webhooks_logs.model';
import { Agenda, Job } from 'agenda/dist';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import { AppType } from '@/enums/app-type.enum';
import BigcommerceAcumaticaService from '@/services/bigcommerce-acumatica.service';
import { logger } from '@utils/logger';

export default function (agenda: Agenda) {
  agenda.define('update-customers-via-sales-order', async (job: Job) => {
    try {
      const { data } = job.attrs;
      let webhookLog = data;

      console.log(webhookLog);
      const organizationId = webhookLog.log.organization;
      const defaultOrg: Organization = await organizationModel.findById(organizationId).populate('apps');

      logger.info(
        `${defaultOrg.name}: Update customers via order ${webhookLog.log.data.data.id}, Last status: ${webhookLog.log.status}${
          webhookLog.log.status == 'fail' ? `, Retries: ${webhookLog.log.retries_count ?? 0}` : ``
        }`,
      );

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

      webhookLog = await webhookLogModel.findOne({ 'data.data.id': webhookLog.log.data.data.id });
      if (webhookLog.status === 'open') {
        const result = await acumaticaWrapper.getSalesOrder(`${webhookLog.data.data.id} - NuvoH2o`, `BillToAddress,ShipToAddress`);
        if (result.length > 0) {
          const salesOrderData = result[0];
          const CustomerID = result[0].CustomerID.value;

          // Check if SO is the latest
          const CustomerSalesRecord = await acumaticaWrapper.getSalesOrderByParams({
            params: {
              $filter: `CustomerID eq '${CustomerID}' and OrderNbr gt '${salesOrderData.OrderNbr.value}'`,
              $top: 3,
            },
          });
          if (CustomerSalesRecord.length === 0) {
            const BillToAddress = {
              Address: {
                AddressLine1: {
                  value: salesOrderData.BillToAddress.AddressLine1.value,
                },
                AddressLine2: {
                  value: salesOrderData.BillToAddress.AddressLine2.value,
                },
                City: { value: salesOrderData.BillToAddress.City.value },
                Country: { value: salesOrderData.BillToAddress.Country.value },
                PostalCode: {
                  value: salesOrderData.BillToAddress.PostalCode.value,
                },
                State: { value: salesOrderData.BillToAddress.State.value },
              },
            };
            const ShipToAddress = {
              Address: {
                AddressLine1: {
                  value: salesOrderData.ShipToAddress.AddressLine1.value,
                },
                AddressLine2: {
                  value: salesOrderData.ShipToAddress.AddressLine2.value,
                },
                City: { value: salesOrderData.ShipToAddress.City.value },
                Country: { value: salesOrderData.ShipToAddress.Country.value },
                PostalCode: {
                  value: salesOrderData.ShipToAddress.PostalCode.value,
                },
                State: { value: salesOrderData.ShipToAddress.State.value },
              },
            };

            const GeneralAddress = {
              Address: {
                AddressLine1: {
                  value: salesOrderData.BillToAddress.AddressLine1.value,
                },
                AddressLine2: {
                  value: salesOrderData.BillToAddress.AddressLine2.value,
                },
                City: { value: salesOrderData.BillToAddress.City.value },
                Country: { value: salesOrderData.BillToAddress.Country.value },
                PostalCode: {
                  value: salesOrderData.BillToAddress.PostalCode.value,
                },
                State: { value: salesOrderData.BillToAddress.State.value },
              },
            };

            console.log({
              CustomerID: { value: CustomerID },
              BillingAddressOverride: {
                value: true,
              },
              ShippingAddressOverride: {
                value: true,
              },
              BillingContact: BillToAddress,
              ShippingContact: ShipToAddress,
              MainContact: GeneralAddress,
            });
            await acumaticaWrapper.createCustomer({
              CustomerID: { value: CustomerID },
              BillingAddressOverride: {
                value: true,
              },
              ShippingAddressOverride: {
                value: true,
              },
              BillingContact: BillToAddress,
              ShippingContact: ShipToAddress,
              MainContact: GeneralAddress,
            });

            webhookLog.status = 'close';
            await webhookLog.save();
          } else {
            webhookLog.status = 'close';
            await webhookLog.save();
          }

          logger.info(`${defaultOrg.name}: Update customers via order ${webhookLog.data.data.id} done`);
        } else {
          agenda.schedule('in 5 minutes', 'update-customers-via-sales-order', { log: webhookLog.log });
        }
      }
    } catch (err) {
      console.log(err);
      logger.info(`Agenda Error 'update-customers-via-sales-order': ${JSON.stringify(err)}`);
    }
  });

  agenda.define('bigcommerce-to-acumatica-order', async (job: Job) => {
    try {
      const bigcommerceAcumaticaService = new BigcommerceAcumaticaService();

      const organizationId = job.attrs.data.log.organization;
      const defaultOrg: Organization = await organizationModel.findById(organizationId).populate('apps');

      logger.info(
        `${defaultOrg.name}: Syncing order ${job.attrs.data.log.data.data.id}, Last status: ${job.attrs.data.log.status}${
          job.attrs.data.log.status == 'fail' ? `, Retries: ${job.attrs.data.log.retries_count ?? 0}` : ``
        }`,
      );

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

      const orderScope: string = job.attrs.data.log.data.scope;
      const bigcommerceOrder = job.attrs.data.log.data;
      const orderDetail = await bigcommerceWrapper.getOrder(bigcommerceOrder.data.id);
      const orderProducts = await bigcommerceWrapper.getOrderProducts(bigcommerceOrder.data.id);
      const orderShippingAddress = await bigcommerceWrapper.getOrderShippingAddresses(bigcommerceOrder.data.id);

      let poNo = '';
      if (orderDetail.billing_address.form_fields.find(e => e.name == 'PO Number')) {
        poNo = orderDetail.billing_address.form_fields.find(e => e.name == 'PO Number').value;
      } else if (orderShippingAddress[0].form_fields.find(e => e.name == 'PO Number')) {
        poNo = orderShippingAddress[0].form_fields.find(e => e.name == 'PO Number').value;
      }

      const orderTransactions: any = await bigcommerceWrapper.getOrderTransactions(orderDetail.id);
      let bigcommerceCustomer: any = '';
      let acumaticaCustomer: any = '';
      const paymentsData = [];

      // if (orderTransactions.data && orderTransactions.data.length) {
      //   for (const orderTransaction of orderTransactions.data) {
      //     if (orderTransaction.gateway_transaction_id !== null || orderTransaction.reference_transaction_id !== null)
      //       paymentsData.push({
      //         PaymentAmount: { value: orderTransaction.amount },
      //         PaymentRef: { value: orderTransaction.gateway_transaction_id || orderTransaction.reference_transaction_id },
      //       });
      //   }
      // }

      // if (orderDetail.payment_status === 'captured') {
      //   paymentsData.push({
      //     ApplicationDate: { value: '2020-08-11T00:00:00+03:00' },
      //     AppliedToOrder: { value: 480.0 },
      //     PaymentAmount: { value: 980.0 },
      //     PaymentMethod: { value: orderDetail.payment_method },
      //     PaymentRef: { value: orderDetail.payment_provider_id },
      //     Capture: { value: true },
      //   });
      // } else {
      //   paymentsData.push({
      //     ApplicationDate: { value: '2020-08-11T00:00:00+03:00' },
      //     AppliedToOrder: { value: 480.0 },
      //     CashAccount: { value: '10600' },
      //     PaymentAmount: { value: 980.0 },
      //     PaymentMethod: { value: 'VISATOK' },
      //     PaymentRef: { value: 'ABC CreditCard' },
      //     Capture: { value: true },
      //   });
      // }
      if (orderDetail.customer_id !== 0) {
        bigcommerceCustomer = await bigcommerceWrapper.getCustomer(orderDetail.customer_id.toString());

        acumaticaCustomer = await acumaticaWrapper.getCustomer({
          $filter: `AccountRef eq '${bigcommerceCustomer.id}-MEDEX' and MainContact/Email eq '${bigcommerceCustomer.email}'`,
        });

        if (acumaticaCustomer.length === 0) {
          const acumaticaCustomerObject = {
            CustomerID: { value: `CUST-${bigcommerceCustomer.id}` },
            CustomerName: { value: `${bigcommerceCustomer.first_name} ${bigcommerceCustomer.last_name}` },
            CustomerClass: { value: 'RETAIL' },
            AccountRef: { value: `${bigcommerceCustomer.id}-MEDEX` },
            MainContact: {
              Email: { value: bigcommerceCustomer.email },
              Address: {
                Country: { value: 'US' },
              },
            },
          };
          const createdAcumaticaCustomer = await acumaticaWrapper.createCustomer(acumaticaCustomerObject);
          acumaticaCustomer = [createdAcumaticaCustomer];
        }
      }
      const billToContact = {
        Attention: { value: orderDetail.billing_address.first_name + ' ' + orderDetail.billing_address.last_name },
        BusinessName: { value: orderDetail.billing_address.company },
        Email: { value: orderDetail.billing_address.email },
        Phone1: { value: orderDetail.billing_address.phone },
      };
      const shipToContact = {
        Attention: { value: orderShippingAddress[0].first_name + ' ' + orderShippingAddress[0].last_name },
        BusinessName: { value: orderShippingAddress[0].company },
        Email: { value: orderShippingAddress[0].email },
        Phone1: { value: orderShippingAddress[0].phone },
      };
      const billToAddress = {
        AddressLine1: { value: orderDetail.billing_address.street_1 },
        AddressLine2: { value: orderDetail.billing_address.street_2 },
        City: { value: orderDetail.billing_address.city },
        Country: { value: 'US' },
        State: { value: orderDetail.billing_address.state },
        PostalCode: { value: orderDetail.billing_address.zip },
      };
      const shipToAddress = {
        AddressLine1: { value: orderShippingAddress[0].street_1 },
        AddressLine2: { value: orderShippingAddress[0].street_2 },
        City: { value: orderShippingAddress[0].city },
        Country: { value: 'US' },
        State: { value: orderShippingAddress[0].state },
        PostalCode: { value: orderShippingAddress[0].zip },
      };
      let status = '';
      switch (orderDetail.status) {
        case 'Awaiting Fulfillment': {
          status = 'Open';
          break;
        }
        case 'Awaiting Fulfillment': {
          status = 'Invoiced';
          break;
        }
        case 'Declined': {
          status = 'Voided';
          break;
        }
        case 'Awaiting Shipment': {
          status = 'Shipping';
          break;
        }
        case 'Verification Required': {
          status = 'Balanced';
          break;
        }
        case 'Pending': {
          status = 'On Hold';
          break;
        }
        case 'Verification Required': {
          status = 'Credit Hold';
          break;
        }
        case 'Shipped': {
          status = 'Completed';
          break;
        }
        case 'Cancelled': {
          status = 'Canceled';
          break;
        }
        case 'Partially Shipped': {
          status = 'Back Order';
          break;
        }
        default: {
          status = '';
          break;
        }
      }
      if (orderScope === 'store/order/updated') {
        const acumaticaSalesOrder = await acumaticaWrapper.getSalesOrder(orderDetail.id);
        // const acumaticaSalesOrderPayment = await acumaticaWrapper.getSalesOrderPayment(acumaticaSalesOrder[0].OrderNbr.value);

        // for (const oldPaymentProduct of acumaticaSalesOrderPayment.Payments) {
        //   paymentsData.push({
        //     id: oldPaymentProduct.id,
        //     delete: true,
        //   });
        // }

        const saleOrderProducts = [];
        for (const oldDetailProduct of acumaticaSalesOrder[0].Details) {
          saleOrderProducts.push({
            id: oldDetailProduct.id,
            delete: true,
          });
        }
        for (const orderProduct of orderProducts) {
          const parentProduct = await bigcommerceWrapper.getProduct(orderProduct.product_id);
          const prepareProduct = await bigcommerceAcumaticaService.getOrderProductUOM(orderProduct, parentProduct);
          saleOrderProducts.push(prepareProduct);
        }
        const salesOrder = {
          OrderType: { value: 'EO' },
          OrderNbr: { value: acumaticaSalesOrder[0].OrderNbr.value },
          CustomerID: { value: acumaticaCustomer[0].CustomerID.value },
          CustomerOrder: { value: poNo },
          ExternalRef: { value: orderDetail.id },
          Status: { value: status },
          Details: saleOrderProducts,
          BillToAddress: billToAddress,
          BillToContact: billToContact,
          BillToAddressOverride: { value: true },
          BillToContactOverride: { value: true },
          ShipToAddress: shipToAddress,
          ShipToContact: shipToContact,
          ShipToAddressOverride: { value: true },
          ShipToContactOverride: { value: true },
          // Payments: paymentsData,
        };
        const updateOrderSync = await acumaticaWrapper.updateOrder(salesOrder);
        if (updateOrderSync.status === 200) {
          const webhookLog = await webhookLogModel.findById(job.attrs.data.log._id);
          webhookLog.status = 'close';
          await webhookLog.save();
        }
      } else {
        const saleOrderProducts = [];
        for (const orderProduct of orderProducts) {
          const parentProduct = await bigcommerceWrapper.getProduct(orderProduct.product_id);
          const prepareProduct = await bigcommerceAcumaticaService.getOrderProductUOM(orderProduct, parentProduct);
          saleOrderProducts.push(prepareProduct);
        }
        const salesOrder = {
          OrderType: { value: 'EO' },
          CustomerID: { value: orderDetail.customer_id !== 0 ? acumaticaCustomer[0].CustomerID.value : 'C-WEB-CUST' },
          CustomerOrder: { value: poNo },
          ExternalRef: { value: orderDetail.id },
          Status: { value: status },
          Details: saleOrderProducts,
          BillToAddress: billToAddress,
          BillToContact: billToContact,
          BillToAddressOverride: { value: true },
          BillToContactOverride: { value: true },
          ShipToAddress: shipToAddress,
          ShipToContact: shipToContact,
          ShipToAddressOverride: { value: true },
          ShipToContactOverride: { value: true },
          // Payments: paymentsData,
        };

        const syncOrder = await acumaticaWrapper.createOrder(salesOrder);
        if (syncOrder.status === 200) {
          const webhookLog = await webhookLogModel.findById(job.attrs.data.log._id);
          webhookLog.status = 'close';
          await webhookLog.save();
        }
      }
    } catch (err) {
      const errorWebhookLog: any = await webhookLogModel.findById(job.attrs.data.log._id);
      errorWebhookLog.retries_count =
        errorWebhookLog.status == 'fail'
          ? errorWebhookLog.retries_count === null || errorWebhookLog.retries_count === undefined
            ? 0
            : errorWebhookLog.retries_count + 1
          : 0;
      errorWebhookLog.status = 'fail';
      errorWebhookLog.error_message = err.message;
      await errorWebhookLog.save();
    }
  });
}
