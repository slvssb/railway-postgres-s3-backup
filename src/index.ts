import signale from "signale"
import { backup } from "./backup"

try {
  signale.info("Initiating DB backup...")
  await backup()
  signale.success("Database backup complete, exiting...")
  process.exit(0)
} catch (error) {
  signale.error("Error while running backup: ", error)
  process.exit(1)
}
