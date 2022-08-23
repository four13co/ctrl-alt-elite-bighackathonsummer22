// import { RequestWithUser } from '@/interfaces/auth.interface';
// import { Request, Response, NextFunction } from 'express';
// import JobService from '../services/jobs.service';
// import JobScheduleService from '../services/jobSchedules.service';

// class JobController {
//   private jobService = new JobService();
//   private jobScheduleService = new JobScheduleService();

//   public getJobs = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const jobs = await this.jobService.findJobs();
//       res.status(200).json({ data: jobs });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getJob = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const jobId = req.params.jobId;
//       const job = await this.jobService.findJob(jobId);
//       const jobSchedule = await this.jobScheduleService.findScheduleByJob(jobId);

//       let data: any;

//       if (jobSchedule) {
//         data = {
//           jobScheduleId: jobSchedule?._id,
//           recurrence: jobSchedule?.recurrence || 'none',
//         };

//         if (jobSchedule?.recurrence === 'date' && jobSchedule?.datetime) {
//           data.dateRecurrence = jobSchedule?.datetime;
//         }

//         if (job.jobType === 'restore' && job?.filename) {
//           const backupHistory: any = await this.jobService.db.backupHistoriesModel.findOne({ datetime: new Date(job?.filename) });

//           data.version = backupHistory;
//         }
//       }

//       res.status(200).json({ data: { ...job['_doc'], ...data } });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       data.createdBy = req.user._id;
//       const job = await this.jobService.createJob(data);
//       res.status(200).json({ data: job });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const jobId = req.params.jobId;
//       const body = req.body;
//       const getJob = await this.jobService.findJob(jobId);
//       if (getJob) {
//         const jobData = getJob;
//         jobData.createdBy = req.user._id;
//         if (body.name) jobData.name = body.name;
//         if (body.jobType) jobData.jobType = body.jobType;
//         if (body.conflictRes) jobData.conflictRes = body.conflictRes;
//         if (body.sourceId) jobData.sourceId = body.sourceId;
//         if (body.destinationId) jobData.destinationId = body.destinationId;
//         if (body.contents) jobData.contents = body.contents;
//         if (body.filename) jobData.filename = body.filename;
//         if (body.sourceHash) jobData.sourceHash = body.sourceHash;

//         jobData.updatedAt = new Date();
//         const job = await this.jobService.updateJob(jobData._id.toString(), jobData);
//         res.status(200).json({ data: job });
//       } else return;
//     } catch (error) {
//       next(error);
//     }
//   };

//   public deleteJob = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const jobId = req.params.jobId;
//       const user = req.user._id;
//       await this.jobService.deleteJob(jobId, user);
//       res.status(200).json({ data: { success: true } });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public runJob = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { jobId } = req.params;

//       const job = await this.jobService.findJob(jobId);
//       global.agenda.agenda.now(`trazetta-backup-&-sync:${job.jobType}`, job);

//       res.json({});
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default JobController;
