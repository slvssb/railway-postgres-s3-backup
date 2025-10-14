# Postgres S3 backups

A simple Bun application to backup your PostgreSQL database to S3 via a cron.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/fOsmc1?referralCode=geckomed)

## Configuration

- `AWS_ACCESS_KEY_ID` - AWS access key ID.

- `AWS_SECRET_ACCESS_KEY` - AWS secret access key, sometimes also called an application key.

- `DATABASE_URL` - The connection string of the database to backup.

- `S3_BUCKET` - The name of the bucket that the access key ID and secret access key are authorized to access.

- `S3_REGION` - The name of the region your bucket is located in, set to `auto` if unknown.

- `S3_ENDPOINT` - The S3 custom endpoint you want to use. Applicable for 3-rd party S3 services such as Cloudflare R2 or Backblaze R2.

- `S3_FORCE_PATH_STYLE` - Use path style for the endpoint instead of the default subdomain style, useful for MinIO. Default `false`

- `BUCKET_STORAGE_CLASS` - Storage class of the Bucket. Default `STANDARD`

- `BUCKET_SUBFOLDER` - Define a subfolder to place the backup files in.

- `BACKUP_FILE_PREFIX` - Add a prefix to the file name. Default `backup`

- `BACKUP_OPTIONS` - Add any valid pg_dump option, supported pg_dump options can be found [here](https://www.postgresql.org/docs/current/app-pgdump.html). Example: `--exclude-table=pattern`

- `PG_VERSION` - Specify a custom PostgreSQL version to override the default version set in the Dockerfile. Default `17`
