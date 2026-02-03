import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

const s3 = new S3Client({
  endpoint,
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey }
});

export async function generatePresignedPut(bucket: string, key: string, contentType = 'application/octet-stream') {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
  return url;
}

export default s3;
