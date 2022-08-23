const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 's3.wasabisys.com',
  accessKeyId: '61B30FGZETJ7IQ15HXQO', //process.env.WASABI_ACCESS_KEY_ID
  secretAccessKey: 'qCceRUmBNvne3kmXrTHa3D8WHneJnj49V3n6l9EK', //process.env.WASABI_ACCESS_KEY_SECRET
});

class WasabiService {
  public bucketName: string;

  constructor(bucketName: string) {
    if (bucketName) this.bucketName = bucketName;
  }

  static async createBucket(bucketName: string) {
    const bucketParams = {
      Bucket: bucketName,
    };

    s3.createBucket(bucketParams, (err: Error, data: Object) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        // todo when bucket is created
        console.log(data);
      }
    }).promise();
  }

  static listBuckets() {
    return s3.listBuckets().promise();
  }

  listObjects() {
    const bucketParams = {
      Bucket: this.bucketName,
    };

    return s3.listObjectsV2(bucketParams).promise();
  }

  putObject({ name, data }: { name: string; data: string }) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: name,
      Body: data,
    };

    return s3.putObject(bucketParams).promise();
  }

  getObject(filename: string) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: filename,
    };

    return s3.getObject(bucketParams).promise();
  }

  deleteFile(filename: string) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: filename,
    };

    return s3.deleteObject(bucketParams).promise();
  }
}

export default WasabiService;
