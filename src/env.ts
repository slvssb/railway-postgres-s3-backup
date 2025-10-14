import signale from "signale"
import { z } from "zod"

const STORAGE_CLASSES = [
  "STANDARD",
  "DEEP_ARCHIVE",
  "EXPRESS_ONEZONE",
  "GLACIER",
  "GLACIER_IR",
  "INTELLIGENT_TIERING",
  "ONEZONE_IA",
  "OUTPOSTS",
  "REDUCED_REDUNDANCY",
  "SNOW",
  "STANDARD_IA",
] as const

const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string({ error: "missing or invalid AWS_ACCESS_KEY_ID" }),
  AWS_SECRET_ACCESS_KEY: z.string({ error: "missing or invalid AWS_SECRET_ACCESS_KEY" }),
  DATABASE_URL: z.url({ error: "missing or invalid DATABASE_URL" }), // The connection string of the database to backup.
  S3_BUCKET: z.string({ error: "missing or invalid S3_BUCKET" }),
  S3_REGION: z.string({ error: "missing or invalid S3_REGION" }),

  // The S3 custom endpoint you want to use.
  S3_ENDPOINT: z.string().optional().default(""),

  // Use path style for the endpoint instead of the default subdomain style, useful for MinIO
  S3_FORCE_PATH_STYLE: z.string().optional().default("false").transform((value) => value === "true"), // prettier-ignore

  // The S3 storage class to use.
  BUCKET_STORAGE_CLASS: z.enum(STORAGE_CLASSES).optional().default("STANDARD"),

  // A subfolder to place the backup files in
  BUCKET_SUBFOLDER: z.string().optional().default(""),

  // Prefix to the file name
  BACKUP_FILE_PREFIX: z.string().optional().default("backup"),

  // This is both time consuming and resource intensive so we leave it disabled by default
  BACKUP_OPTIONS: z.string().optional().default(""), // Any valid pg_dump option.
})

const result = envSchema.safeParse(Bun.env)

if (!result.success) {
  signale.error(`\n\n--Invalid environment variables--\n\n${z.prettifyError(result.error)}`)
  process.exit(1)
}

export const env = result.data
