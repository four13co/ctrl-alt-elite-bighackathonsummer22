// import { Request, Response, NextFunction } from 'express';
// import JobHistoryService from '../services/jobHistories.service';

// class JobHistoryController {
//   private historyService = new JobHistoryService();

//   public getJobHistories = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const histories = await this.historyService.findJobHistories();
//       res.status(200).json({ data: histories });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getJobHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const historyId = req.params.historyId;
//       const history = await this.historyService.findJobHistory(historyId);
//       res.status(200).json({ data: history });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createJobHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       if (data.startDatetime) data.startDatetime = new Date(data.startDatetime);
//       if (data.endDatetime) data.endDatetime = new Date(data.endDatetime);
//       const history = await this.historyService.createJobHistory(data);
//       res.status(200).json({ data: history });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateJobHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const historyId = req.params.historyId;
//       const body = req.body;
//       const getHistory = await this.historyService.findJobHistory(historyId);
//       if (getHistory) {
//         const histoyData = getHistory;
//         if (body.startDatetime) histoyData.startDatetime = new Date(body.startDatetime);
//         if (body.endDatetime) histoyData.endDatetime = new Date(body.endDatetime);
//         if (body.runTime) histoyData.runTime = body.runTime;
//         if (body.job) histoyData.job = body.job;
//         if (body.status) histoyData.status = body.status;

//         const history = await this.historyService.updateJobHistory(histoyData._id.toString(), histoyData);
//         res.status(200).json({ data: history });
//       } else return;
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default JobHistoryController;
