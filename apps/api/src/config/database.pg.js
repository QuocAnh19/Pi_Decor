/**
 * Lớp tương thích ngược (re-export layer) để các file import cũ từ database.pg.js tiếp tục hoạt động.
 * Toàn bộ logic đã được module hoá trong thư mục ./db/.
 */
export {
  resolveSslConfig,
  TABLES,
  JSONB_COLUMNS,
  assertKnownTable,
  quoteCol,
  serializeValue,
  pool,
  testDbConnection,
  getDirectPool,
  directPool,
  isConnectionError,
  runWithRetry,
  db,
  getAll,
  insertRow,
} from "./db/index.js";
