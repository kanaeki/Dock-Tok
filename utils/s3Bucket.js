// const S3 = require("aws-sdk/clients/s3");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { stringCleaner } = require("./mixFunction");
const uuid = require("uuid").v4;

// exports.s3Uploadv2 = async (file) => {
//   const s3 = new S3();

//   const param = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: `uploads/${uuid()}-${file.originalname}`,
//     Body: file.buffer,
//   };

//   return await s3.upload(param).promise();
// };

exports.s3Videov3 = async (file) => {
  const s3client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const fileName = stringCleaner(file.originalname || file.name);
  const path = `uploads/${uuid()}-${fileName}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path,
    Body: file.buffer,
  };
  try {
    const uploadParallel = new Upload({
      client: s3client,
      queueSize: 4, // optional concurrency configuration
      partSize: 5542880, // optional size of each part
      leavePartsOnError: false, // optional manually handle dropped parts
      params,
    });

    // checking progress of upload
    // uploadParallel.on("httpUploadProgress", (progress) => {
    //   //
    // });

    // after completion of upload
    return uploadParallel.done().then((data) => {
      return {
        result: data,
      };
    });
  } catch (err) {}
};

exports.s3Uploadv3 = async (file) => {
  const s3client = new S3Client();
  const fileName = stringCleaner(file.originalname || file.name);
  const path = `uploads/${uuid()}-${fileName}`;
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path,
    Body: file.buffer,
  };

  return {
    path: path,
    result: await s3client.send(new PutObjectCommand(param)),
  };
};
exports.s3Deletev3 = async (path) => {
  const s3client = new S3Client();

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path,
  };

  return {
    path: path,
    result: await s3client.send(new DeleteObjectCommand(param)),
  };
};
exports.s3MultiUploadv3 = async (files) => {
  const s3client = new S3Client();
  const paths = [];
  // `${process.env.AWS_BUCKET_ENDPOINT}${data.path}`
  const params = files.map((file) => {
    const fileName = stringCleaner(file.originalname || file.name);
    const path = `uploads/${uuid()}-${fileName}`;
    paths.push(`${process.env.AWS_BUCKET_ENDPOINT}${path}`);
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path,
      Body: file.buffer,
    };
  });

  return {
    path: paths,
    result: await Promise.all(
      params.map((param) => s3client.send(new PutObjectCommand(param))),
    ),
  };
};
