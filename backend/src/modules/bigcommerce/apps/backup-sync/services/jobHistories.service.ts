// import { CreateJobHistoryDto } from '../dtos/jobHistories.dtos';
// import { JobHistory } from '../interfaces/jobHistories.interface';

// import { Job } from '../interfaces/jobs.interface';
// import Database from '../databases';

// class JobHistoryService {
//   public db = new Database();

//   public async findJobHistories(): Promise<JobHistory[]> {
//     const histories: JobHistory[] = await this.db.jobHistoriesModel.find().populate({
//       path: 'job',
//       populate: {
//         path: 'sourceId destinationId',
//       },
//     });
//     return histories;
//   }

//   public async findJobHistoryByJob(job: Job): Promise<JobHistory> {
//     const history: JobHistory = await this.db.jobHistoriesModel.findOne({
//       job
//     })
//     return history
//   }

//   public async findJobHistory(historyId: string): Promise<JobHistory> {
//     const history: JobHistory = await this.db.jobHistoriesModel.findById(historyId);
//     return history;
//   }

//   public async createJobHistory(historyData: CreateJobHistoryDto): Promise<JobHistory> {
//     const history: JobHistory = await this.db.jobHistoriesModel.create(historyData);
//     return history;
//   }
//   public async updateJobHs(historyId: any, historyData: JobHistory): Promise<JobHistory> {
//     const history: JobHistory = await this.db.jobHistoriesModel.findByIdAndUpdate(historyId, historyData);
//     return history;
//   }

//   public async updateJobHistory(historyId: string, historyData: JobHistory): Promise<JobHistory> {
//     const history: JobHistory = await this.db.jobHistoriesModel.findByIdAndUpdate(historyId, historyData);
//     return history;
//   }
// }

// export default JobHistoryService;
