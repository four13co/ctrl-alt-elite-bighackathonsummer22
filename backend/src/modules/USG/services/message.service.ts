import fetch, { RequestInit, Headers } from 'node-fetch';
class MessageService {
  public async listrakFetch(data) {
    const { listId, transMessId, token, email, link, tokenType } = data;
    const requestURL = `https://api.listrak.com/email/v1/List/${listId}/TransactionalMessage/${transMessId}/Message`;
    const fetchHeaders = new Headers();

    fetchHeaders.append('Content-Type', 'application/json');
    fetchHeaders.append('Authorization', `${tokenType} ${token}`);

    const bodyObj = { emailAddress: `${email}` };

    //for forgot password transactional message
    if (transMessId === process.env.USG_LISTRAK_FORGOT_PASS_ID) {
      bodyObj['segmentationFieldValues'] = [{ segmentationFieldId: process.env.USG_LISTRAK_FORGOT_SEGMENTATION_FIELD_ID, value: link }];
    }
    const raw = JSON.stringify(bodyObj);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: fetchHeaders,
      body: raw,
    };

    const response = await fetch(requestURL, requestOptions);

    return await response.json();
  }
}

export default MessageService;
