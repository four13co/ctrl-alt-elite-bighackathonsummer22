import { Agenda } from 'agenda/es';
import { dbConnection } from '@databases';
import path from 'path';
import fs from 'fs';
import { logger } from '@utils/logger';
import triggerModel from '@/models/triggers.model';
import { TriggerType } from '@/enums/trigger-type.enum';
import { Trigger } from '@/interfaces/triggers.model';
//import JobSchedulesService from '@modules/bigcommerce/apps/backup-sync/services/jobSchedules.service';

class TranzettaAgenda {
  public agenda: Agenda;
  static _instance: TranzettaAgenda;

  constructor() {
    if (process.env.NODE_ENV !== 'test' && !TranzettaAgenda._instance) {
      TranzettaAgenda._instance = this;
      this.agenda = new Agenda({
        db: { address: dbConnection.url },
        processEvery: '30 seconds',
        defaultConcurrency: 5,
        maxConcurrency: 15,
        defaultLockLimit: 4,
        lockLimit: 12,
        defaultLockLifetime: 1000 * 60,
      });
    }
    return TranzettaAgenda._instance;
  }

  public registerJobs = (): void => {
    logger.info(`Registering Agenda Jobs`);
    const jobsPath: string = path.join(__dirname, 'define');
    fs.readdirSync(jobsPath).forEach((file: string) => {
      if (path.extname(file) == `.js`) {
        const jobPath: string = path.join(jobsPath, file);
        import(jobPath)
          .then(job => {
            job.default(this.agenda);
          })
          .catch(err => {
            logger.warn(`Incorrect Agenda File (${file}):${err.message}`);
          });
      }
    });
  };

  public createJobs = async (): Promise<void> => {
    logger.info(`Creatin g Agenda Jobs`);
    /*
      Create an API to initiate cron
    */

    // const triggers: Trigger[] = await triggerModel.find({ type: TriggerType.CronJob });

    // for (const trigger of triggers) {
    //   const data = {
    //     organizationId: trigger.organization._id,
    //   };

    //   this.agenda.create(trigger.job, data).repeatEvery(trigger.trigger).unique({ 'data.organizationId': data.organizationId }).save();
    // }

    // this.agenda.every('1 hour', 'recon-bigcommerce-order');
    // this.agenda.now('register-bigcommerce-webhook');

    // Manually sync orders webhooks
    // this.agenda.every('1 hour', 'bigcommerce-to-acumatica-order-schedule', { organization: 'Medex Supply' });

    // Nuvo discount code sync
    // this.agenda.every('5 minutes', 'bigcommerce-to-acumatica-discount-codes', { organization: 'Nuvo' });

    // ICEE run every midnight
    // this.agenda.every('0 0 * * *', 'acumatica-duplicate-cross-reference', { organization: 'ICEE' });

    // create buckets
    // this.agenda.now('create-wasabi-buckets');

    // comment this code - backup and sync - Darwin
    // load all jobs from jobSchedules collection and loop
    // const jobSchedulesService = new JobSchedulesService();

    // const jobs = await jobSchedulesService.findJobSchedules();

    // logger.info('Jobs', jobs);
    // for (const job of jobs) {
    //   // create the agenda for each job schedule
    //   /**
    //    * Agenda Job
    //    * @backup ==> trazetta-backup-&-sync:backup
    //    * @restore ==> trazetta-backup-&-sync:restore
    //    * @sync ==> trazetta-backup-&-sync:sync
    //    */

    //   if (job.recurrence) {
    //     this.agenda
    //       .create(`trazetta-backup-&-sync:${job.job.jobType}`, job.job['_doc'])
    //       .repeatEvery(job.recurrence)
    //       .unique({ 'data._id': job.job._id }, { insertOnly: true })
    //       .save();
    //   } else if (job.datetime) {
    //     this.agenda.create(`trazetta-backup-&-sync:${job.job.jobType}`, job.job['_doc']).schedule(job.datetime).save();
    //   }
    //   // this.agenda.create(`trazetta-backup-&-sync:${job.job.jobType}`, job.job).now().save(); //trigger now
    // }
  };

  public async start(): Promise<void> {
    try {
      this.registerJobs();
      await this.createJobs();
    } catch (err) {
      logger.warn(`Failed to initialize jobs`);
      logger.error(err);
    }

    logger.info(`Starting Agenda Jobs`);
    await this.agenda.start();
  }
}

export default TranzettaAgenda;
