// comment this code - backup and sync - Darwin
import { Agenda, Job } from 'agenda/dist';
// import BackupSync from '@modules/bigcommerce/apps/backup-sync/services/backupSync.service';
// import { Job as JobInterface } from '@modules/bigcommerce/apps/backup-sync/interfaces/jobs.interface';
// import ConnectionService from '../../modules/bigcommerce/apps/backup-sync/services/connections.service';
// import { logger } from '@/utils/logger';

export default function (agenda: Agenda) {
//   const backupSyncService = new BackupSync();
//   const connectionService = new ConnectionService();

//   agenda.define('trazetta-backup-&-sync:backup', async (job: Job) => {
//     try {
//       const jobAtt = job.attrs.data as JobInterface;
//       const connection = await connectionService.findConnectionById(jobAtt.sourceId._id);
//       jobAtt.sourceId = connection;
//       backupSyncService.backup(jobAtt);
//     } catch (e) {
//       logger.error(e)
//     }
//   });

//   agenda.define('trazetta-backup-&-sync:restore', async (job: Job) => {
//     try {
//       const jobAtt = job.attrs.data as JobInterface;
//       const connection = await connectionService.findConnectionById(jobAtt.destinationId._id);
//       jobAtt.destinationId = connection;
//       backupSyncService.restore(agenda,jobAtt);
//     } catch (e) {
//       logger.error(e)
//     }
//   });

//   agenda.define('trazetta-backup-&-sync:sync', async (job: Job) => {
//     try {
//       const jobAtt = job.attrs.data as JobInterface;
//       const srcConnection = await connectionService.findConnectionById(jobAtt.sourceId._id);
//       const destConnection = await connectionService.findConnectionById(jobAtt.destinationId._id);
//       jobAtt.sourceId = srcConnection;
//       jobAtt.destinationId = destConnection;
//       backupSyncService.sync(agenda, jobAtt);
//     } catch (e) {
//       logger.error(e)
//     }
//   });

}
