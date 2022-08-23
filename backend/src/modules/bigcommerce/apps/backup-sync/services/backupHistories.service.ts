// import { CreateBackupHistoryDto } from '../dtos/backupHistories.dtos';
// import { BackupHistory } from '../interfaces/backupHistories.interface';
// import Database from '../databases';

// class BackupHistoryService {
//   public db = new Database();

//   public async findBackupHistories(): Promise<BackupHistory[]> {
//     const histories: BackupHistory[] = await this.db.backupHistoriesModel.find().populate({
//       path: 'job',
//       populate: {
//         path: 'sourceId destinationId',
//       },
//     });
//     return histories;
//   }

//   public async findBackupHistory(historyId: string): Promise<BackupHistory> {
//     const history: BackupHistory = await this.db.backupHistoriesModel.findById(historyId);
//     return history;
//   }

//   public async createBackupHistory(historyData: CreateBackupHistoryDto): Promise<BackupHistory> {
//     const history: BackupHistory = await this.db.backupHistoriesModel.create(historyData);
//     return history;
//   }

//   public async updateBackupHistory(historyId: string, historyData: BackupHistory): Promise<BackupHistory> {
//     const history: BackupHistory = await this.db.backupHistoriesModel.findByIdAndUpdate(historyId, historyData);
//     return history;
//   }
// }

// export default BackupHistoryService;
