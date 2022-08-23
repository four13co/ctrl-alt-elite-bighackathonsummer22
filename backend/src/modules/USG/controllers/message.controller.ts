import { Request, Response, NextFunction } from 'express';
// import fetch from 'node-fetch';
import MessageService from '../services/message.service';

class MessageController {
  /**
   * Trigger send Listrak send Message endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listId: string | number = process.env.USG_LISTRAK_LIST_ID;
      const transMessId: string | number = req.body.link ? process.env.USG_LISTRAK_FORGOT_PASS_ID : process.env.USG_LISTRAK_CREATE_ACCOUNT_ID;
      const { token, email, link, tokenType } = req.body;
      const dataObj: object = { listId: listId, transMessId: transMessId, token: token, email: email, link: link, tokenType: tokenType };
      const service = new MessageService();
      await service.listrakFetch(dataObj);
      res.status(200).json('Message is sent!');
    } catch (error) {
      next(error);
    }
  };
}

export default MessageController;
