// import WasabiService from '@/services/wasabi.service';
// import { RequestWithUser } from '@/interfaces/auth.interface';
// import { Request, Response, NextFunction } from 'express';
// import JobScheduleService from '../services/jobSchedules.service';
// import JobService from '../services/jobs.service';

// class JobScheduleController {
//   private scheduleService = new JobScheduleService();
//   private jobService = new JobService();

//   public getJobSchedules = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const schedules = await this.scheduleService.findJobSchedules();
//       res.status(200).json({ data: schedules });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getJobSchedule = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const schedId = req.params.schedId;
//       const schedule = await this.scheduleService.findJobSchedule(schedId);
//       res.status(200).json({ data: schedule });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createJobSchedule = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       data.createdBy = req.user._id;

//       if (data.datetime) {
//         data.datetime = new Date(data.datetime);
//       }

//       const schedule = await this.scheduleService.createJobSchedule(data);
//       const job = await this.jobService.findJob(data.job);

//       if (data?.recurrence !== 'date') {
//         global.agenda.agenda
//           .create(`trazetta-backup-&-sync:${job.jobType}`, job['_doc'])
//           .repeatEvery(data.recurrence)
//           .unique({ 'data._id': job._id }, { insertOnly: true })
//           .save();
//       } else if (data.datetime) {
//         global.agenda.agenda.create(`trazetta-backup-&-sync:${job.jobType}`, job['_doc']).schedule(data.datetime).save();
//       }

//       res.status(200).json({ data: schedule });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateJobSchedule = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const jobId = req.params.schedId;
//       const body = req.body;
//       const getSchedule = await this.scheduleService.findJobSchedule(jobId);

//       if (getSchedule) {
//         const schedData = getSchedule;
//         schedData.createdBy = req.user._id;
//         if (body.datetime) schedData.datetime = new Date(body.datetime);
//         if (body.job) schedData.job = body.job;
//         // if (body.createdBy) schedData.createdBy = req.user._id;

//         schedData.recurrence = body.recurrence;

//         const schedule = await this.scheduleService.updateJobSchedule(schedData._id.toString(), schedData);
//         res.status(200).json({ data: schedule });
//       } else return;
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default JobScheduleController;
