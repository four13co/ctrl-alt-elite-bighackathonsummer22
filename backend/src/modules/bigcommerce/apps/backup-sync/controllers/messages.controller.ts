// import { Request, Response, NextFunction } from 'express';
// import MessageService from '../services/message.service';

// class MessageController {
//   private messageService = new MessageService();

//   public getMessages = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const messages = await this.messageService.findMessages();
//       res.status(200).json({ data: messages });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public getMessage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const messageId = req.params.messageId;
//       const message = await this.messageService.findMessage(messageId);
//       res.status(200).json({ data: message });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createMessage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       const message = await this.messageService.createMessage(data);
//       res.status(200).json({ data: message });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateMessage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const messageId = req.params.messageId;
//       const body = req.body;
//       const getMessage = await this.messageService.findMessage(messageId);
//       if (getMessage) {
//         const messageData: any = getMessage;
//         if (body.subject) messageData.subject = new Date(body.datetime);
//         if (body.firstname) messageData.firstname = body.job;
//         if (body.lastname) messageData.lastname = body.reference;
//         if (body.company) messageData.company = body.reference;
//         if (body.email) messageData.email = body.reference;
//         if (body.message) messageData.message = body.reference;

//         const message = await this.messageService.updateMessage(messageData._id.toString(), messageData);
//         res.status(200).json({ data: message });
//       } else return;
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default MessageController;
