// import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
// import { JobType } from '../models/enum/jobType.enum';
// import { ResolutionType } from '../models/enum/resolutionType.enum';

// export class CreateJobDto {
//   @IsString()
//   public name: string;

//   @IsEnum(JobType)
//   public jobType: JobType;

//   @IsEnum(ResolutionType)
//   public conflictRes: ResolutionType;

//   @IsNotEmpty()
//   public sourceId: object;

//   @IsNotEmpty()
//   public destinationId: object;

//   @IsNotEmpty()
//   public contents: object;

//   @IsString()
//   public createdBy: string;

//   @IsString()
//   public filename: string;

//   @IsString()
//   public sourceHash: string;
// }
