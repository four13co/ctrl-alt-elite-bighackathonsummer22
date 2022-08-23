import { ObjectId } from 'mongoose';
import BigCommerce from 'node-bigcommerce';

class AlgoliaService {
  private scriptData = [
    {
      name: 'Algolia script css',
      description: 'Algolia script css',
      html: "<script type=\"text/javascript\">\n            var linkLoader = function () {\n                var headID = document.getElementsByTagName('head')[0];\n                var link = document.createElement('link');\n\n                link.rel = 'stylesheet';\n                headID.appendChild(link);\n\n                link.href = 'https://tranzetta-v2-scripts-git-development-four13.vercel.app/main.css';\n\n            };\n\n   linkLoader();</script>",
      auto_uninstall: true,
      load_method: 'default',
      location: 'footer',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
    {
      name: 'Algolia script lib',
      description: 'Algolia script lib',
      html: '<script src="https://tranzetta-v2-scripts-git-development-four13.vercel.app/main.js" ></script>',
      auto_uninstall: true,
      load_method: 'default',
      location: 'head',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
    {
      name: 'Algolia script script',
      description: 'Algolia script script',
      html: '',
      auto_uninstall: true,
      load_method: 'default',
      location: 'footer',
      visibility: 'all_pages',
      kind: 'script_tag',
      consent_category: 'essential',
    },
  ];

  private async removeWidget(bigCommerce): Promise<any> {
    const res = await bigCommerce.get(`/content/scripts`);
    const scripts = res.data;

    if (scripts.length) {
      const scriptName = this.scriptData.map(sd => sd.name);

      const installedScripts = scripts.filter(script => scriptName.includes(script.name)).map(script => script.uuid);

      await Promise.all(
        installedScripts.map(async item => {
          await bigCommerce.delete(`/content/scripts/${item}`);
        }),
      );
    }
  }

  public async addWidget(setting: any, store: any): Promise<any> {
    const apikeys = {
      clientId: '1fctxoxgu7chx35bzs22rlzidi59k2j',
      accessToken: store.token,
      responseType: 'json',
      storeHash: store.url,
      apiVersion: 'v3',
    };
    const bigCommerce = new BigCommerce(apikeys);

    //const container = 'searchbox2';
    let styling = '{}';
    if (setting.styling) styling = JSON.stringify(setting.styling);
    let loopCondition = `var searchNode = document.querySelectorAll(".algoliaSearchNode"); var searchNodeList = Object.values(searchNode); searchNodeList.map((input) => {`;
    let html = `<script type="module">createContainer(); ${loopCondition} unifiedFour13('${setting.setting.appId}', '${setting.setting.searchKey}', input.id, ${styling}); }); addAttributes();</script>`;
    this.scriptData[2].html = html;

    // Delete the old scripts that are injected in bigcommerce
    await this.removeWidget(bigCommerce);

    await bigCommerce.post(`/content/scripts`, this.scriptData[0]);
    await bigCommerce.post(`/content/scripts`, this.scriptData[1]);
    await bigCommerce.post(`/content/scripts`, this.scriptData[2]);
  }

  public async uninstallWidget(store: any): Promise<any> {
    const apikeys = {
      clientId: '1fctxoxgu7chx35bzs22rlzidi59k2j',
      accessToken: store.token,
      responseType: 'json',
      storeHash: store.url,
      apiVersion: 'v3',
    };
    const bigCommerce = new BigCommerce(apikeys);
    await this.removeWidget(bigCommerce);
  }
}

export default AlgoliaService;
