// import { Router } from 'express';
// import { Routes } from '@interfaces/routes.interface';
// import AuthContoller from '../controllers/auth.controller';
// import ConnectionController from '../controllers/connection.controller';
// import JobController from '../controllers/job.controller';
// import JobScheduleController from '../controllers/jobSchedule.controller';
// import JobHistoryController from '../controllers/jobHistory.controller';
// import BackupHistoryController from '../controllers/backupHistory.controller';
// import BackupSyncController from '../controllers/backupSync.controller';
// import SystemLogController from '../controllers/systemLog.controller';
// import MessageController from '../controllers/messages.controller';
// import GetUsersControllers from '../controllers/getUsers.controller';
// import validationMiddleware from '@middlewares/validation.middleware';
// import authMiddleware from '@middlewares/auth.middleware';
// import { CreateConnectionDto } from '../dtos/connections.dtos';
// import { CreateJobDto } from '../dtos/jobs.dtos';
// import { CreateScheduleDto } from '../dtos/jobSchedules.dtos';
// import { CreateJobHistoryDto } from '../dtos/jobHistories.dtos';
// import { CreateBackupHistoryDto } from '../dtos/backupHistories.dtos';
// import { CreateSystemLogDto } from '../dtos/systemLogs.dtos';
// import { CreateMessageDto } from '../dtos/message.dto';

// class ModuleBigcommerceBackupSyncRoute implements Routes {
//   public path = '/modules/bigcommerce/backup-sync/api/';
//   public router = Router();
//   public authController = new AuthContoller();
//   public connectionController = new ConnectionController();
//   public jobController = new JobController();
//   public schedController = new JobScheduleController();
//   public jobhistoryController = new JobHistoryController();
//   public backuphistoryController = new BackupHistoryController();
//   public backupSyncController = new BackupSyncController();
//   public systemLogController = new SystemLogController();
//   public messageController = new MessageController();
//   public getUsers = new GetUsersControllers();

//   constructor() {
//     this.initializeRoutes();
//   }

//   private initializeRoutes() {
//     // BigCommerce Callback URLs
//     this.router.get(`${this.path}bc/auth`, this.authController.auth);
//     this.router.get(`${this.path}bc/load`, this.authController.load);
//     this.router.get(`${this.path}bc/uninstall`, this.authController.uninstall);

//     // Auth
//     this.router.post(`${this.path}login`, this.authController.logIn);

//     // Connection
//     this.router.get(`${this.path}connections`, authMiddleware, this.connectionController.getConnections);
//     this.router.get(`${this.path}users/:_id`, authMiddleware, this.getUsers.getCurrentUser);
//     this.router.get(`${this.path}connections/:connectionId`, authMiddleware, this.connectionController.getConnection);
//     this.router.post(
//       `${this.path}connections`,
//       validationMiddleware(CreateConnectionDto, 'body', true),
//       authMiddleware,
//       this.connectionController.createConnection,
//     );
//     this.router.put(
//       `${this.path}connections/:connectionId`,
//       validationMiddleware(CreateConnectionDto, 'body', true),
//       authMiddleware,
//       this.connectionController.updateConnection,
//     );
//     this.router.delete(`${this.path}connections/:connectionId`, authMiddleware, this.connectionController.deleteConnection);

//     // Jobs
//     this.router.get(`${this.path}jobs`, authMiddleware, this.jobController.getJobs);
//     this.router.get(`${this.path}jobs/:jobId`, authMiddleware, this.jobController.getJob);
//     this.router.post(`${this.path}jobs`, validationMiddleware(CreateJobDto, 'body', true), authMiddleware, this.jobController.createJob);
//     this.router.put(`${this.path}jobs/:jobId`, validationMiddleware(CreateJobDto, 'body', true), authMiddleware, this.jobController.updateJob);
//     this.router.delete(`${this.path}jobs/:jobId`, authMiddleware, this.jobController.deleteJob);
//     //run job manually
//     this.router.get(`${this.path}run-job/:jobId`, authMiddleware, this.jobController.runJob);

//     // Job Schedule
//     this.router.get(`${this.path}schedules`, authMiddleware, this.schedController.getJobSchedules);
//     this.router.get(`${this.path}schedules/:schedId`, authMiddleware, this.schedController.getJobSchedule);
//     this.router.post(
//       `${this.path}schedules`,
//       validationMiddleware(CreateScheduleDto, 'body', true),
//       authMiddleware,
//       this.schedController.createJobSchedule,
//     );
//     this.router.put(
//       `${this.path}schedules/:schedId`,
//       validationMiddleware(CreateScheduleDto, 'body', true),
//       authMiddleware,
//       this.schedController.updateJobSchedule,
//     );

//     // Job History
//     this.router.get(`${this.path}job-histories`, authMiddleware, this.jobhistoryController.getJobHistories);
//     this.router.get(`${this.path}job-histories/:historyId`, authMiddleware, this.jobhistoryController.getJobHistory);
//     this.router.post(
//       `${this.path}job-histories`,
//       validationMiddleware(CreateJobHistoryDto, 'body', true),
//       authMiddleware,
//       this.jobhistoryController.createJobHistory,
//     );
//     this.router.put(
//       `${this.path}job-histories/:historyId`,
//       validationMiddleware(CreateJobHistoryDto, 'body', true),
//       authMiddleware,
//       this.jobhistoryController.updateJobHistory,
//     );

//     // Backup History
//     this.router.get(`${this.path}backup-histories`, authMiddleware, this.backuphistoryController.getBackupHistories);
//     this.router.get(`${this.path}backup-histories/:historyId`, authMiddleware, this.backuphistoryController.getBackupHistory);
//     this.router.post(
//       `${this.path}backup-histories`,
//       validationMiddleware(CreateBackupHistoryDto, 'body', true),
//       authMiddleware,
//       this.backuphistoryController.createBackupHistory,
//     );
//     this.router.put(
//       `${this.path}backup-histories/:historyId`,
//       validationMiddleware(CreateBackupHistoryDto, 'body', true),
//       authMiddleware,
//       this.backuphistoryController.updateBackupHistory,
//     );

//     // System Logs
//     this.router.get(`${this.path}system-logs`, authMiddleware, this.systemLogController.getAllSyncLogs);
//     this.router.post(
//       `${this.path}system-logs`,
//       validationMiddleware(CreateSystemLogDto, 'body', true),
//       authMiddleware,
//       this.systemLogController.createSystemLogs,
//     );

//     // Message
//     this.router.get(`${this.path}messages`, authMiddleware, this.messageController.getMessages);
//     this.router.get(`${this.path}messages/:messageId`, authMiddleware, this.messageController.getMessage);
//     this.router.post(
//       `${this.path}messages`,
//       validationMiddleware(CreateMessageDto, 'body', true),
//       authMiddleware,
//       this.messageController.createMessage,
//     );
//     this.router.put(
//       `${this.path}messages/:messageId`,
//       validationMiddleware(CreateMessageDto, 'body', true),
//       authMiddleware,
//       this.messageController.updateMessage,
//     );

//     this.router.get(`${this.path}bc-content/:connectionId`, authMiddleware, this.backupSyncController.getContents);
//   }
// }

// export default ModuleBigcommerceBackupSyncRoute;
