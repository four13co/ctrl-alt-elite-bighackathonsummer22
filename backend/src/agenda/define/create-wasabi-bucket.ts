// comment this code - backup and sync - Darwin
import { Agenda } from 'agenda/dist';
// import moment from 'moment';
// import { logger } from '@utils/logger';
// import WasabiService from '@services/wasabi.service';
// import AccountsService from '@modules/bigcommerce/apps/backup-sync/services/accounts.service';
// import { BUCKET_KEY } from '@modules/bigcommerce/apps/backup-sync/constants';

export default function (agenda: Agenda) {
//   const accountService = new AccountsService();
//   interface BucketInterface {
//     Name: string;
//   }
//   interface BucketsInterface {
//     Buckets: BucketInterface[];
//   }

//   agenda.define('create-wasabi-buckets', async () => {
//     // load all buckets
//     logger.info(`create-wasabi-buckets`);
//     const buckets: BucketsInterface = await WasabiService.listBuckets();
//     let _bucket: string[];

//     if (buckets) {
//       // filter relevant result to get the store hash for each bucket
//       _bucket = buckets.Buckets.filter((i: BucketInterface) => i.Name.includes(BUCKET_KEY)).map((i: BucketInterface) =>
//         i.Name.replace(BUCKET_KEY, ''),
//       );
//     }

//     if (_bucket) {
//       // load all store hash that has no buckets
//       const accounts = await accountService.findAccounts({
//         storeHash: {
//           $nin: _bucket,
//         },
//       });

//       if (accounts) {
//         // create bucket for each accounts
//         accounts.forEach(i => {
//           WasabiService.createBucket(`${BUCKET_KEY}${i.storeHash}`);
//         });
//       }
//     }

//     /**
//      * EXAMPLE OF USAGE FOR WASABI during job call
//      */
//     //await backupSyncService.backupAndSync(sync , connections ,BUCKET_KEY)
//     //const storeDataList = await backupSyncService.buildStoreData(sync, connections);

//     /* storeDataList.forEach(async i => {
//        const { storeHash } = i;

//        const wasabi = new WasabiService(`${BUCKET_KEY}${storeHash}`);
//        const filename = Date.now().toString();

//        // Store Object => Convert data to string
//        await wasabi.putObject({
//          name: filename,
//          data: JSON.stringify({ ...i, storeHash: undefined }),
//        });

//        // list all objects stored inside the bucket
//        const list = await wasabi.listObjects();
//        console.log(`filenames: ${list.Contents.map((i: any) => i.Key)}`);

//        // Retrieve Object
//        const getFile = await wasabi.getObject(filename);
//        console.log(`Contents: ${Object.keys(JSON.parse(getFile.Body.toString('ascii')))}`);

//        // Delete Object
//        await wasabi.deleteFile(filename);
//      });*/
//   });
}
