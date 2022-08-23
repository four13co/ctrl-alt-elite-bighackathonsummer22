// import { Schema } from 'mongoose';

// const jobSchema: Schema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   jobType: {
//     type: String,
//     enum: ['backup', 'restore', 'sync'],
//   },
//   conflictRes: {
//     type: String,
//     enum: ['STOP_JOB', 'IGNORE_AND_UPDATE', 'INSERT_NON_CONFLICT'],
//   },
//   sourceId: {
//     type: Schema.Types.ObjectId,
//     ref: 'connections',
//   },
//   destinationId: {
//     type: Schema.Types.ObjectId,
//     ref: 'connections',
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
//   contents: {
//     type: Object,
//   },
//   createdAt: {
//     type: Date,
//     default: new Date(),
//   },
//   updatedAt: {
//     type: Date,
//     default: new Date(),
//   },
//   createdBy: {
//     type: String,
//   },
//   filename: {
//     type: String,
//   },
//   sourceHash: {
//     type: String,
//   },
// });

// export default jobSchema;
