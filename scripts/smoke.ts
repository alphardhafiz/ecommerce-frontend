import { api } from "../lib/api.ts";

async function main() {
  try {
    const data = await api.get<{ status: string }>("/health");
    console.log("OK  /health ->", JSON.stringify(data));
    process.exit(0);
  } catch (err) {
    console.error(
      "FAIL /health ->",
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}

main();
