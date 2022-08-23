process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import Agenda from '@/agenda';
import Agendash from 'agendash';
import validateEnv from '@utils/validateEnv';

import { Routes } from '@interfaces/routes.interface';

import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import AppRoute from '@routes/app.route';
import WebhookRoute from '@routes/webhook.route';
import OrganizationRoute from '@routes/organization.route';
import TriggerRoute from './routes/trigger.route';
import BigcommerceAcumaticaRoute from '@routes/bigcommerce-acumatica.route';
import ShopifyAcumaticaRoute from '@routes/shopify-acumatica.route';
import OrgAppRoute from '@routes/organization-apps.route';
// Modules
import ModuleBigcommerceAlgoliaRoute from '@modules/bigcommerce/apps/algolia/routes/app.route';
//import ModuleBigcommerceBackupSyncRoute from '@modules/bigcommerce/apps/backup-sync/routes/app.route';
import ModuleBigcommerceUSGListrakRoute from '@modules/USG/routes/app.route';

import ModuleBigcommerceNFT from '@modules/bigcommerce/apps/NFT/routes/app.route';

import ModuleBigcommerceMigRoute from '@modules/bigcommerce/apps/mig/routes/app.route';
import ModuleShopifyICEERoute from '@modules/icee/routes/app.route';
import ModuleBigcommerceCherryRepRoute from '@modules/cherry-republic/routes/app.route';

import ModuleBigcommerceBulkImage from '@modules/bigcommerce/apps/bulk-image-upload/routes/app.route';
// Testing Routes. Files need to be added in gitignore
// import TestingRoute from '@routes/testing.route';

validateEnv();

const routes: Routes[] = [
  new IndexRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new WebhookRoute(),
  new AppRoute(),
  new OrganizationRoute(),
  new TriggerRoute(),
  new BigcommerceAcumaticaRoute(),
  new ShopifyAcumaticaRoute(),
  new OrgAppRoute(),

  // Modules
  new ModuleBigcommerceAlgoliaRoute(),
  //new ModuleBigcommerceBackupSyncRoute(),
  new ModuleBigcommerceUSGListrakRoute(),
  new ModuleBigcommerceMigRoute(),
  new ModuleShopifyICEERoute(),
  new ModuleBigcommerceNFT(),
  new ModuleBigcommerceCherryRepRoute(),
  new ModuleBigcommerceBulkImage()
  // Testing Routes
  // new TestingRoute()
];

const app = new App(routes);
app.connectToDatabase();

global.agenda = new Agenda();

app.getServer().use('/agenda', Agendash(global.agenda.agenda));

global.agenda.start();

app.listen();
