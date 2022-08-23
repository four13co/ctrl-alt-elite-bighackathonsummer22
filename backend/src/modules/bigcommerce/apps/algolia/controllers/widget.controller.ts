import { Request, Response, NextFunction } from 'express';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import { AppType } from '@/enums/app-type.enum';

import { RequestWithToken } from '../interfaces/auth.interface';

class WidgetController {
  private scriptData = [
    {
      name: 'Algolia script 1',
      description: 'Algolia script 1',
      html: '<script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js" integrity="sha256-EXPXz4W6pQgfYY3yTpnDa3OH8/EPn16ciVsPQ/ypsjk=" crossorigin="anonymous"></script>',
      auto_uninstall: true,
      load_method: 'default',
      location: 'head',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
    {
      name: 'Algolia script 2',
      description: 'Algolia script 2',
      html: '<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.8.3/dist/instantsearch.production.min.js" integrity="sha256-LAGhRRdtVoD6RLo2qDQsU2mp+XVSciKRC8XPOBWmofM=" crossorigin="anonymous"></script>',
      auto_uninstall: true,
      load_method: 'default',
      location: 'head',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
    {
      name: 'Algolia script 4', // For injecting the CSS
      description: 'Algolia script 4',
      html: "<script type=\"text/javascript\">\n            var linkLoader = function () {\n                var headID = document.getElementsByTagName('head')[0];\n                var link = document.createElement('link');\n\n                link.rel = 'stylesheet';\n                link.crossOrigin = 'anonymous'\n                link.integrity = 'sha256-TehzF/2QvNKhGQrrNpoOb2Ck4iGZ1J/DI4pkd2oUsBc='\n\n                headID.appendChild(link);\n\n                link.href = 'https://cdn.jsdelivr.net/npm/instantsearch.css@7.4.5/themes/satellite-min.css';\n\n            };\n\n            window.onload = function() { \n                linkLoader(); \n            };\n        </script>",
      auto_uninstall: true,
      load_method: 'default',
      location: 'footer',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
    {
      name: 'Algolia script 3',
      description: 'Algolia script 3',
      html: '',
      auto_uninstall: true,
      load_method: 'default',
      location: 'footer',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
  ];

  public addWidget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { searchId, searchKey, indexName } = req.body;
      let mainScript = `<script type="text/javascript"> 
        const searchClient = algoliasearch("${searchId}", "${searchKey}"); 
        const search = instantsearch({indexName: "${indexName}",searchClient,});
        search.addWidgets([instantsearch.widgets.searchBox({container: '#searchbox1',}),instantsearch.widgets.hits({container: '#hits',templates: {item(item) {return \`
        <div><img src="\${item.image}" align="left" alt="\${name}" /><div class="hit-name">\${item.name}</div><div class=hit-description>\${item.description}</div><div class="hit-price">$\${item.price}</div></div>\`;}}})]); search.start();
        </script>`;

      this.scriptData[3].html = mainScript;
      const template = {
        name: 'Algolia Test',
        template:
          '<div class="ais-InstantSearch">\n          <h1>Algolia instant search e-commerce demo</h1>\n\n          <div class="right-panel">\n            <div id="searchbox1"></div>\n            <div id="hits"></div>\n            <div id="pagination"></div>\n          </div>\n        </div>',
      };

      // const template = {
      //   name: 'Algolia Test',
      //   template: '<div id="autocomplete"></div>',
      // };

      const defaultOrg: Organization = await organizationModel.findOne({ name: 'Demo Org' }).populate('apps');
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);

      await bigcommerceWrapper.createScript(this.scriptData[0]);
      await bigcommerceWrapper.createScript(this.scriptData[1]);
      await bigcommerceWrapper.createScript(this.scriptData[2]);
      await bigcommerceWrapper.createScript(this.scriptData[3]);
      await bigcommerceWrapper.createWidgetTemplate(template);

      const result = { message: 'success' };

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public addWidgetStyle = async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  };
}

export default WidgetController;
