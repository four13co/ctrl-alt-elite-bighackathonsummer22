// import { dbConnection } from '../databases/config';
// import { Model, createConnection, Document } from 'mongoose';

// import { BackupHistory } from '../interfaces/backupHistories.interface';
// import backupHistorySchema from '../models/backupHistories.model';
// import { JobHistory } from '../interfaces/jobHistories.interface';
// import jobHistoriesSchema from '../models/jobHistories.model';
// import { Connection } from '../interfaces/connections.interface';
// import connectionSchema from '../models/connections.model';
// import { Job } from '../interfaces/jobs.interface';
// import jobSchema from '../models/jobs.model';
// import { JobSchedule } from '../interfaces/jobsSchedules.interface';
// import jobScheduleSchema from '../models/jobSchedules.model';
// import { SysLog } from '../interfaces/sysLogs.interface';
// import sysLogSchema from '../models/sysLogs.model';
// import { Message } from '../interfaces/message.interface';
// import messageModel from '../models/messages.model';

// import { Setting } from '../interfaces/settings.interface';
// import settingSchema from '../models/settings.model';
// import { Account } from '../interfaces/accounts.interface';
// import accountSchema from '../models/accounts.model';
// import { Store } from '../interfaces/stores.interface';
// import storeSchema from '../models/stores.model';
// import { App } from '../interfaces/apps.interface';
// import appSchema from '../models/apps.model';

// class Database {
//   public conn: any;
//   public backupHistoriesModel: Model<BackupHistory, Document>;
//   public jobHistoriesModel: Model<JobHistory, Document>;
//   public connectionsModel: Model<Connection, Document>;
//   public jobsModel: Model<Job, Document>;
//   public jobSchedulesModel: Model<JobSchedule, Document>;
//   public sysLogsModel: Model<SysLog, Document>;
//   public settingsModel: Model<Setting, Document>;
//   public accountsModel: Model<Account, Document>;
//   public appsModel: Model<App, Document>;
//   public storesModel: Model<Store, Document>;
//   public messageModel: Model<Message, Document>;

//   constructor() {
//     this.connectToDatabase();
//   }

//   private connectToDatabase() {
//     this.conn = createConnection(dbConnection.url, dbConnection.options);
//     this.backupHistoriesModel = this.conn.model('backupHistories', backupHistorySchema);
//     this.jobHistoriesModel = this.conn.model('jobHistories', jobHistoriesSchema);
//     this.connectionsModel = this.conn.model('connections', connectionSchema);
//     this.jobsModel = this.conn.model('jobs', jobSchema);
//     this.jobSchedulesModel = this.conn.model('jobSchedules', jobScheduleSchema);
//     this.sysLogsModel = this.conn.model('sysLogs', sysLogSchema);
//     this.messageModel = this.conn.model('messages', messageModel);

//     this.settingsModel = this.conn.model('settings', settingSchema);
//     this.accountsModel = this.conn.model('accounts', accountSchema);
//     this.storesModel = this.conn.model('stores', storeSchema);
//     this.appsModel = this.conn.model('apps', appSchema);
//   }
// }

// export default Database;
