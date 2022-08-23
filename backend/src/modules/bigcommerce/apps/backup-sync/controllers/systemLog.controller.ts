// import { RequestWithUser } from '@/interfaces/auth.interface';
// import { Request, Response, NextFunction } from 'express';
// import SystemLogService from '../services/systemLogs.service';
// class SystemLogController {
//   private systemLogService = new SystemLogService();

//   public getAllSyncLogs = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const logs = await this.systemLogService.findAllSyncJobs();
//       res.status(200).json({ data: logs });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createSystemLogs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       if (data.createdBy === '') data.createdBy = req.user._id;
//       const logs = await this.systemLogService.createSystemLog(data);
//       res.status(200).json({ data: logs });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default SystemLogController;
