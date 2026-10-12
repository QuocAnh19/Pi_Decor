import { pool } from "../src/config/database.pg.js";

async function run() {
  const client = await pool.connect();
  try {
    const plan1 = await client.query(
      "EXPLAIN (ANALYZE, BUFFERS) select * from leads order by created_at desc limit 20 offset 0"
    );
    console.log("=== PLAN 1: Leads list (default pagination) ===");
    console.log(plan1.rows.map((r) => r["QUERY PLAN"]).join("\n"));

    const term = "%lan%";
    const plan2 = await client.query(
      "EXPLAIN (ANALYZE, BUFFERS) select * from leads where (name ilike $1 or phone ilike $2 or email ilike $3) order by created_at desc limit 20 offset 0",
      [term, term, term]
    );
    console.log("\n=== PLAN 2: Leads search with term ===");
    console.log(plan2.rows.map((r) => r["QUERY PLAN"]).join("\n"));

    await client.query("SET enable_seqscan = off");
    const plan3 = await client.query(
      "EXPLAIN (ANALYZE, BUFFERS) select * from leads where (name ilike $1 or phone ilike $2 or email ilike $3)",
      [term, term, term]
    );
    console.log("\n=== PLAN 3: Leads search (Bitmap Or with GIN Trigram Indexes) ===");
    console.log(plan3.rows.map((r) => r["QUERY PLAN"]).join("\n"));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

