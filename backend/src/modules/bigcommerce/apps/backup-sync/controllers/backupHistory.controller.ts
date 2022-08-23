// import { Request, Response, NextFunction } from 'express';
// import BackupHistoryService from '../services/backupHistories.service';

// class BackupHistoryController {
//   private historyService = new BackupHistoryService();

//   public getBackupHistories = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const histories = await this.historyService.findBackupHistories();
//       res.status(200).json({ data: histories });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getBackupHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const historyId = req.params.historyId;
//       const history = await this.historyService.findBackupHistory(historyId);
//       res.status(200).json({ data: history });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createBackupHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       const history = await this.historyService.createBackupHistory(data);
//       res.status(200).json({ data: history });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateBackupHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const historyId = req.params.historyId;
//       const body = req.body;
//       const getHistory = await this.historyService.findBackupHistory(historyId);
//       if (getHistory) {
//         const histoyData: any = getHistory;
//         if (body.datetime) histoyData.datetime = new Date(body.datetime);
//         if (body.job) histoyData.job = body.job;
//         if (body.reference) histoyData.reference = body.reference;

//         const history = await this.historyService.updateBackupHistory(histoyData._id.toString(), histoyData);
//         res.status(200).json({ data: history });
//       } else return;
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default BackupHistoryController;
