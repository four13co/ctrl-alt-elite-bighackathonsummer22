// import { Request, Response, NextFunction } from 'express';
// import BackupSyncService from '../services/backupSync.service';
// import ConnectionsService from '../services/connections.service';

// class BackupSyncController {
//   private backupSyncService = new BackupSyncService();
//   private connectionsService = new ConnectionsService();

//   public getContents = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { connectionId } = req.params;
//       const connection = await this.connectionsService.findConnection(connectionId);
//       const data = await this.backupSyncService.getAllStoreContents(connection);

//       res.status(200).json({ data: { success: true, contents: data } });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default BackupSyncController;
