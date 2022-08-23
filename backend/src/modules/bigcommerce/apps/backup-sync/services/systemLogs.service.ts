// import { SysLog } from '../interfaces/sysLogs.interface';
// import Database from '../databases';
// import { CreateSystemLogDto } from '../dtos/systemLogs.dtos';

// class SystemLogService {
//   public db = new Database();

//   public async findAllSyncJobs(): Promise<SysLog[]> {
//     const logs: SysLog[] = await this.db.sysLogsModel.find();
//     return logs;
//   }

//   public async createSystemLog(logsData: CreateSystemLogDto): Promise<SysLog> {
//     const logs: SysLog = await this.db.sysLogsModel.create(logsData);
//     return logs;
//   }
// }

// export default SystemLogService;
