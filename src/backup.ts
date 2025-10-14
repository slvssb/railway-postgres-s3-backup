import os from "os"
import path from "path"
import signale from "signale"
import { env } from "./env"

const s3Client = new Bun.S3Client({
  storageClass: env.BUCKET_STORAGE_CLASS,
  virtualHostedStyle: env.S3_FORCE_PATH_STYLE,
  acl: "private",
  type: "application/gzip",
})

const dumpToFile = async (filePath: string) => {
  signale.info("1. Dumping DB to file...")

  const result = await Bun.$`pg_dump --dbname=${env.DATABASE_URL} --format=tar ${env.BACKUP_OPTIONS} | gzip > ${filePath}`
  const errMessage = result.stderr.toString("utf-8")
  if (errMessage) {
    throw new Error(result.stderr.toString("utf-8"))
  }

  // check if archive is valid and contains data
  const isValidArchive = (await Bun.$`gzip -cd ${filePath} | head -c1`.text()).length === 1
  if (!isValidArchive) {
    throw new Error("Backup archive file is invalid or empty; check for errors above")
  }

  signale.info("Backup archive file is valid")
  signale.info("Backup filesize:", Bun.file(filePath).size)

  signale.success("DB dumped to file...")
}

const uploadToS3 = async ({ name, path }: { name: string; path: string }) => {
  console.log("")
  signale.info("2. Uploading backup to S3...")

  if (env.S3_ENDPOINT) {
    signale.info(`Using custom endpoint: ${env.S3_ENDPOINT}`)
  }

  if (env.BUCKET_SUBFOLDER) {
    name = env.BUCKET_SUBFOLDER + "/" + name
  }

  await s3Client.write(name, await Bun.file(path).arrayBuffer())
  signale.success("Backup uploaded to S3...")
}

const deleteFile = async (path: string) => {
  console.log("")
  signale.info("3. Deleting file...")
  await Bun.file(path).unlink()
}

export const backup = async () => {
  const date = new Date().toISOString()
  const timestamp = date.replace(/[:.]+/g, "-")
  const filename = `${env.BACKUP_FILE_PREFIX}-${timestamp}.tar.gz`
  const filepath = path.join(os.tmpdir(), filename)

  await dumpToFile(filepath)
  await uploadToS3({ name: filename, path: filepath })
  await deleteFile(filepath)
}
