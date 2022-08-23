// import { CreateJobDto } from '../dtos/jobs.dtos';
// import { Job } from '../interfaces/jobs.interface';
// import Database from '../databases';
// import SystemLogService from '../services/systemLogs.service';

// class JobService {
//   public db = new Database();

//   public async findJobs(): Promise<Job[]> {
//     const jobs: Job[] = await this.db.jobsModel.find().populate({
//       path: 'sourceId destinationId',
//     });
//     return jobs;
//   }

//   public async findJob(jobId: string): Promise<Job> {
//     const job: Job = await this.db.jobsModel
//       .findById(jobId)
//       .select('_id name sourceId destinationId contents jobType conflictRes sourceHash filename');
//     return job;
//   }

//   public async createJob(jobData: CreateJobDto): Promise<Job> {
//     let job: Job = await this.db.jobsModel.create(jobData);

//     job = await this.db.jobsModel.populate(job, {
//       path: 'sourceId destinationId',
//     });

//     this.createSyslog('The Job has been created', `title : ${jobData.name}, Type : ${jobData.jobType}`, jobData.createdBy);
//     return job;
//   }

//   public async updateJob(jobId: string, jobData: Job): Promise<Job> {
//     const job: Job = await this.db.jobsModel.findByIdAndUpdate(jobId, jobData);
//     this.createSyslog('The Job has been updated', `jobId : ${jobId}, Type : ${jobData.jobType}`, jobData.createdBy);
//     return job;
//   }

//   public async deleteJob(jobId: string, createdBy: string): Promise<Job> {
//     const job: Job = await this.db.jobsModel.findByIdAndDelete(jobId);
//     this.createSyslog('The Job was deleted', `jobId : ${jobId}`, createdBy);
//     return job;
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

// export default JobService;
