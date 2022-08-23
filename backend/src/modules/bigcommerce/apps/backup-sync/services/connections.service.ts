// import { CreateConnectionDto } from '../dtos/connections.dtos';
// import { Connection } from '../interfaces/connections.interface';
// import Database from '../databases';
// import SystemLogService from '../services/systemLogs.service';

// class ConnectionService {
//   public db = new Database();

//   public async findConnections(): Promise<Connection[]> {
//     const connections: Connection[] = await this.db.connectionsModel.find();
//     return connections;
//   }

//   public async findConnection(connectionId: string): Promise<Connection> {
//     const connection: Connection = await this.db.connectionsModel.findById(connectionId);
//     return connection;
//   }

//   public async findConnectionById(connectionId: any): Promise<Connection> {
//     const connection: Connection = await this.db.connectionsModel.findOne(connectionId);
//     return connection;
//   }

//   public async createConnection(connectionData: CreateConnectionDto): Promise<Connection> {
//     const connection: Connection = await this.db.connectionsModel.create(connectionData);
//     this.createSyslog('The Connection has been created', `name : ${connectionData.name}, env: ${connectionData.env}`, connectionData.createdBy);
//     return connection;
//   }

//   public async updateConnection(connectionId: string, connectionData: Connection): Promise<Connection> {
//     const connection: Connection = await this.db.connectionsModel.findByIdAndUpdate(connectionId, connectionData);
//     this.createSyslog('The Connection has been updated', `name : ${connectionData.name}, env: ${connectionData.env}`, connectionData.createdBy);
//     return connection;
//   }

//   public async deleteConnection(connectionId: string, user: string): Promise<Connection> {
//     const connection: Connection = await this.db.connectionsModel.findByIdAndDelete(connectionId);
//     this.createSyslog('The Connection was deleted', `connectionId : ${connectionId}`, user);
//     return connection;
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

// export default ConnectionService;
