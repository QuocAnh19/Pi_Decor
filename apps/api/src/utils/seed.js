import "dotenv/config";
import { runAllSeeds } from "./seed/index.js";

runAllSeeds()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed thất bại:", err);
    process.exit(1);
  });
