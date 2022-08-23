import fetch from "node-fetch";
import { logger } from '@utils/logger';

class FedexService {

  public async AddressVerification(params: object = {}) : Promise<string> {

    try {
      logger.info(`Initiate Fedex Access`);

      const fedexApiURL = process.env.FEDEX_API_URL
      const devKey = process.env.FEDEX_API_KEY
      const pass = process.env.FEDEX_API_SECRET
      const accountNumber = process.env.FEDEX_ACCOUNT_NUMBER
      const meterNumber = process.env.FEDEX_METER_NUMBER

      // Form details
      let address = {
        address1: "",
        address2: "",
        city: "",
        stateOrProvinceCode: "",
        postalCode: "",
        countryCode: ""
      };

      Object.keys(params).map(function(key, index) {
        address[key] = params[key];
      });

      let street = ((address.address2 ? address.address2 : '') + ' ' + (address.address1 ? address.address1 : '' )).trim()
      const city = address.city ? address.city : '';
      const stateCode = address.stateOrProvinceCode ? address.stateOrProvinceCode : '';
      const postalCode = address.postalCode ? address.postalCode : '';
      const countryCode = address.countryCode ? address.countryCode : '';

      logger.info(`Create Fedex XML body`);
      const raw = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\r\nxmlns:v4="http://fedex.com/ws/addressvalidation/v4">\r\n <soapenv:Header/>\r\n <soapenv:Body>\r\n <v4:AddressValidationRequest>\r\n <v4:WebAuthenticationDetail>\r\n <v4:UserCredential>\r\n <v4:Key>${devKey}</v4:Key>\r\n <v4:Password>${pass}</v4:Password>\r\n </v4:UserCredential>\r\n </v4:WebAuthenticationDetail>\r\n <v4:ClientDetail>\r\n <v4:AccountNumber>${accountNumber}</v4:AccountNumber>\r\n <v4:MeterNumber>${meterNumber}</v4:MeterNumber>\r\n <v4:Localization>\r\n <v4:LanguageCode>EN</v4:LanguageCode>\r\n <v4:LocaleCode>EN</v4:LocaleCode>\r\n </v4:Localization>\r\n </v4:ClientDetail>\r\n <v4:TransactionDetail>\r\n<v4:CustomerTransactionId>AddressValidationRequest_v54534</v4:CustomerTransactionId>\r\n <v4:Localization>\r\n <v4:LanguageCode>EN</v4:LanguageCode>\r\n <v4:LocaleCode>EN</v4:LocaleCode>\r\n </v4:Localization>\r\n </v4:TransactionDetail>\r\n <v4:Version>\r\n <v4:ServiceId>aval</v4:ServiceId>\r\n <v4:Major>4</v4:Major>\r\n <v4:Intermediate>0</v4:Intermediate>\r\n <v4:Minor>0</v4:Minor>\r\n </v4:Version>\r\n <v4:InEffectAsOfTimestamp>2020-02-25T12:34:56-06:00</v4:InEffectAsOfTimestamp>\r\n <v4:AddressesToValidate>\r\n <v4:Address>\r\n <v4:StreetLines>${street}</v4:StreetLines>\r\n <v4:City>${city}</v4:City>\r\n <v4:StateOrProvinceCode>${stateCode}</v4:StateOrProvinceCode>\r\n <v4:PostalCode>${postalCode}</v4:PostalCode>\r\n <v4:CountryCode>${countryCode}</v4:CountryCode>\r\n </v4:Address>\r\n </v4:AddressesToValidate>\r\n </v4:AddressValidationRequest>\r\n </soapenv:Body>\r\n</soapenv:Envelope>`;

      let requestOptions = {
        method: "POST",
        mode: "cors",
        headers: {
          'SOAPAction': '"#MethodName"',
          'Content-Type': 'application/xml',
          'Cookie': 'siteDC=edc'
        },
        // credentials: "include",
        body: raw
        // redirect: "follow",
      };

      logger.info(`Request Fedex API`);
      const response = await fetch(fedexApiURL, requestOptions);

      if(!response.ok) {
        logger.error(`[AddressVerification] ${response.url} >> StatusCode:: ${response.status}, Message:: ${response.statusText}`);
        throw new Error(`unexpected response ${response.statusText}`);
      }

      const data = await response.text();

      return data;

    }
    catch(err) {
      logger.error(`[AddressVerification] Error:: ${err}`);
      return Promise.reject(err);
    }
  }
}

export default FedexService;
