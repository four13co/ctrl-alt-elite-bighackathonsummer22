// import { CreateMessageDto } from '../dtos/message.dto';
// import { Message } from '../interfaces/message.interface';
// import Database from '../databases';

// class MessageService {
//   public db = new Database();

//   public async findMessages(params: object = {}): Promise<Message[]> {
//     const messages: Message[] = await this.db.messageModel.find(params);
//     return messages;
//   }

//   public async findMessage(messageId: string): Promise<Message> {
//     const message: Message = await this.db.messageModel.findById(messageId);
//     return message;
//   }

//   public async createMessage(messageData: CreateMessageDto): Promise<Message> {
//     const message: Message = await this.db.messageModel.create(messageData);
//     return message;
//   }

//   public async updateMessage(messageId: string, messageData: CreateMessageDto): Promise<Message> {
//     const message: Message = await this.db.messageModel.findByIdAndUpdate(messageId, messageData);
//     return message;
//   }

//   public async deleteMessage(messageId: string): Promise<Message> {
//     const message: Message = await this.db.messageModel.findByIdAndDelete(messageId);
//     return message;
//   }
// }

// export default MessageService;
