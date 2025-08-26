"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const node_path_1 = __importDefault(require("node:path"));
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const node_url_1 = require("node:url");
dotenv_1.default.config({
    path: process.env.DOTENV_CONFIG_PATH || node_path_1.default.resolve(process.cwd(), ".env"),
});
const __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
const __dirname = node_path_1.default.dirname(__filename);
const dataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [node_path_1.default.resolve(__dirname, "../src/entities/*.ts")],
    migrations: [node_path_1.default.resolve(__dirname, "./migrations/*.ts")],
});
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map