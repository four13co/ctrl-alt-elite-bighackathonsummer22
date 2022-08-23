import { Request, Response, NextFunction } from 'express';
import appService from '../services/apps.service';
import { RequestWithFiles } from '../interfaces/upload.interface';

class AppsController {
  private appService = new appService();
  public appName = 'BulkImage';

  public updateWebDavConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const apps = await this.appService.findAllApps({ name: this.appName, 'apiKey.accessToken': body.token });

        if(apps){
            const app = apps;
            if(body.appData.webDav) app[0].appData.webDav = body.appData.webDav;
            const app_response = await this.appService.updateApp(apps[0]._id.toString(), app[0]);
            res.status(200).json({ data: app_response });
        }
        
    } catch (error) {
      next(error);
    }
  };


  public uploadImages = async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    const { createClient, AuthType } = require("webdav");
    const uploadData = req.files;
    const body = req.body;

    try {
        const apps = await this.appService.findAllApps({ name: this.appName, 'apiKey.accessToken': body.token });
        
        const client = createClient(
            req.body.path,
            {
                authType: AuthType.Digest,
                username: req.body.username,
                password: req.body.password,
            }
        );
      
        // store image url
        const url = req.body.path.replace('/dav', '/content/');
        const data_array = [];
        const uploaded_response = [];
        const error_upload = [];

        for(let i = 0; i < uploadData.length; i++){
            const data_upload = await client.putFileContents("/content/" + uploadData[i].originalname, uploadData[i].buffer, { overwrite: false });
            const filename = uploadData[i].originalname;
            const image_url = url + filename;

            if(data_upload){
              const new_images = {
                  filename: filename,
                  url: image_url,
                  tag: ''
              }
              uploaded_response.push(filename)
              data_array.push(new_images);
            } else {
              error_upload.push(filename);
            }
        }

        console.log("Apps APPDATA", apps[0].appData);

        if(apps){
            const app = apps;
            const existing_img = apps[0].appData.files;
            if(data_array){ //pag igwang naupload
              if(existing_img){ //pag igwang exisitng tapos iappend na sana so existing
                Array.prototype.push.apply(existing_img, data_array);
                if(uploadData) apps[0].appData.files = existing_img;
              } else {
                if(uploadData) apps[0].appData.files = data_array;
              }
              await this.appService.updateApp(apps[0]._id.toString(), apps[0]);
            }
            
            res.status(200).json({ data: {uploaded: uploaded_response, not_uploaded: error_upload, files: apps[0].appData.files } });
        } else {
          res.status(404).json({ data: 'Error'});
        }
        
    } catch (error) {
      next(error);
    }
  };

  public getAllImages = async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    const body = req.body;
    const storeHash = req.params.storeHash;
    const apps = await this.appService.findAllApps({ name: this.appName, 'apiKey.storeHash': storeHash });

    if(apps){
      res.status(200).json({ data: apps[0].appData.files });
    } else {
      res.status(404).json({ data: 'No data'});
    }
  }

  public tagImages = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const apps = await this.appService.findByFiles({queryParams: {'appData.files': {$elemMatch: {filename: body.filename, url: body.url}}}, querySet: {"$set": {'appData.files.$.tag': body.tag}}});

    if(apps){
      res.status(200).json({ data: apps[0].appData.files });
    } else {
      res.status(404).json({ data: 'No data'});
    }
  }
}

export default AppsController;
