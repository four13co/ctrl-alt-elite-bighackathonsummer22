// import { CreateScheduleDto } from '../dtos/jobSchedules.dtos';
// import { JobSchedule } from '../interfaces/jobsSchedules.interface';
// import SystemLogService from '../services/systemLogs.service';
// import Database from '../databases';

// class JobScheduleService {
//   public db = new Database();

//   public async findJobSchedules(): Promise<JobSchedule[]> {
//     const schedules: JobSchedule[] = await this.db.jobSchedulesModel.find().populate({
//       path: 'job',
//       populate: {
//         path: 'sourceId destinationId',
//       },
//     });
//     return schedules;
//   }

//   public async findJobSchedule(schedId: string): Promise<JobSchedule> {
//     const schedule: JobSchedule = await this.db.jobSchedulesModel.findById(schedId);
//     return schedule;
//   }

//   public async findScheduleByJob(jobId: string): Promise<JobSchedule> {
//     const schedule: JobSchedule = await this.db.jobSchedulesModel.findOne({ job: jobId }).populate({
//       path: 'job',
//     });
//     return schedule;
//   }

//   public async createJobSchedule(schedData: CreateScheduleDto): Promise<JobSchedule> {
//     const schedule: JobSchedule = await this.db.jobSchedulesModel.create(schedData);
//     this.createSyslog(
//       'JobSchedule has been added',
//       `jobId : ${schedData.job}, dateTime: ${schedData.datetime}, recurrence: ${schedData.recurrence}`,
//       schedData.createdBy,
//     );
//     return schedule;
//   }

//   public async updateJobSchedule(schedId: string, schedData: JobSchedule): Promise<JobSchedule> {
//     const schedule: JobSchedule = await this.db.jobSchedulesModel.findByIdAndUpdate(schedId, schedData);
//     this.createSyslog(
//       'JobSchedule has been updated',
//       `schedId : ${schedId}, dateTime: ${schedData.datetime}, recurrance: ${schedData.recurrence}`,
//       schedData.createdBy,
//     );
//     return schedule;
//   }

//   public createSyslog(mes: string, content: string, createdBy: string) {
//     const historyService = new SystemLogService();
//     historyService.createSystemLog({
//       message: mes,
//       body: content,
//       userId: !createdBy ? '' : createdBy,
//     });
//   }
// }

// export default JobScheduleService;
