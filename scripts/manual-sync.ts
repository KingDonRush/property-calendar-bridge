import { runSyncJob } from "../src/lib/jobs/sync";

async function main(): Promise<void> {
  const result = await runSyncJob();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

