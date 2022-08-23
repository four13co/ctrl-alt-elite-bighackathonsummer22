// import { RequestWithUser } from '@/interfaces/auth.interface';
// import { Request, Response, NextFunction } from 'express';
// import ConnectionService from '../services/connections.service';
// import BackupSyncService from '../services/backupSync.service';

// class ConnectionController {
//   private connectionService = new ConnectionService();
//   private backupSyncService = new BackupSyncService();

//   public getConnections = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const connections = await this.connectionService.findConnections();
//       res.status(200).json({ data: connections });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getConnection = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const connectionId = req.params.connectionId;
//       const connection = await this.connectionService.findConnection(connectionId);
//       res.status(200).json({ data: connection });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createConnection = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       data.createdBy = req.user._id;
//       if (!data.storeHash && data.apiPath) {
//         data.storeHash = data.apiPath.split('stores/')[1].split('/')[0] || '';
//       }
//       await this.backupSyncService.getAllStoreContents(data);
//       const connection = await this.connectionService.createConnection(data);
//       res.status(200).json({ data: connection });
//     } catch (err) {
//       const error = JSON.parse(JSON.stringify(err));
//       if (error.responseBody) {
//         return res.json({ error, errorType: 'bigcommerce' });
//       }
//       next(err);
//     }
//   };

//   public updateConnection = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const connectionId = req.params.connectionId;
//       const body = req.body;
//       // body.createdBy = req.user._id;
//       const getConnection = await this.connectionService.findConnection(connectionId);
//       if (getConnection) {
//         const connectionData = getConnection;
//         connectionData.createdBy = req.user._id;
//         if (body.name) connectionData.name = body.name;
//         if (body.env) connectionData.env = body.env;
//         if (body.storeHash) connectionData.storeHash = body.storeHash;
//         if (body.apiPath) connectionData.apiPath = body.apiPath;
//         if (body.clientId) connectionData.clientId = body.clientId;
//         if (body.clientSecret) connectionData.clientSecret = body.clientSecret;
//         if (body.accessToken) connectionData.accessToken = body.accessToken;

//         connectionData.updatedAt = new Date();
//         await this.backupSyncService.getAllStoreContents(connectionData);
//         const connection = await this.connectionService.updateConnection(connectionData._id.toString(), connectionData);
//         res.status(200).json({ data: connection });
//       } else return;
//     } catch (err) {
//       const error = JSON.parse(JSON.stringify(err));
//       if (error.responseBody) {
//         return res.json({ error, errorType: 'bigcommerce' });
//       }
//       next(err);
//     }
//   };

//   public deleteConnection = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const connectionId = req.params.connectionId;
//       const user = req.user._id;
//       await this.connectionService.deleteConnection(connectionId, user);
//       res.status(200).json({ data: { success: true } });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default ConnectionController;
