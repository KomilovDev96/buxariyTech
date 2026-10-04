import 'dotenv/config';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
async function main() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Local bucket initializer cannot run in production');
  const endpoint = new URL(process.env.STORAGE_ENDPOINT!);
  if (!['localhost', '127.0.0.1'].includes(endpoint.hostname))
    throw new Error('Local endpoints only');
  const client = new S3Client({
      endpoint: endpoint.href,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
    }),
    Bucket = process.env.STORAGE_BUCKET!;
  try {
    await client.send(new HeadBucketCommand({ Bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket }));
  }
  await client.send(
    new PutBucketPolicyCommand({
      Bucket,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${Bucket}/*`],
          },
        ],
      }),
    }),
  );
  console.log('Local portfolio media bucket ready.');
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
