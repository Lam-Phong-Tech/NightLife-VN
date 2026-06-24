"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.8.0",
    "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id        Int      @id @default(autoincrement())\n  email     String   @unique\n  password  String\n  name      String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"orderBy\",\"cursor\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_count\",\"_avg\",\"_sum\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"email\",\"password\",\"name\",\"createdAt\",\"updatedAt\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"set\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
    graph: "NwsQCRwAACkAMB0AAAQAEB4AACkAMB8CAAAAASABAAAAASEBACsAISIBACwAISNAAC0AISRAAC0AIQEAAAABACABAAAAAQAgCRwAACkAMB0AAAQAEB4AACkAMB8CACoAISABACsAISEBACsAISIBACwAISNAAC0AISRAAC0AIQEiAAAuACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAGHwIAAAABIAEAAAABIQEAAAABIgEAAAABI0AAAAABJEAAAAABAQgAAAkAIAYfAgAAAAEgAQAAAAEhAQAAAAEiAQAAAAEjQAAAAAEkQAAAAAEBCAAACwAwAQgAAAsAMAYfAgA3ACEgAQA0ACEhAQA0ACEiAQA1ACEjQAA2ACEkQAA2ACECAAAAAQAgCAAADgAgBh8CADcAISABADQAISEBADQAISIBADUAISNAADYAISRAADYAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgBhUAAC8AIBYAADAAIBcAADMAIBgAADIAIBkAADEAICIAAC4AIAkcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAcACEiAQAdACEjQAAeACEkQAAeACEDAAAABAAgAwAAFgAwFAAAFwAgAwAAAAQAIAMAAAUAMAQAAAEAIAkcAAAaADAdAAAXABAeAAAaADAfAgAbACEgAQAcACEhAQAcACEiAQAdACEjQAAeACEkQAAeACENFQAAIAAgFgAAKAAgFwAAIAAgGAAAIAAgGQAAIAAgJQIAAAABJgIAAAAEJwIAAAAEKAIAAAABKQIAAAABKgIAAAABKwIAAAABLAIAJwAhDhUAACAAIBgAACYAIBkAACYAICUBAAAAASYBAAAABCcBAAAABCgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBACUAIS0BAAAAAS4BAAAAAS8BAAAAAQ4VAAAjACAYAAAkACAZAAAkACAlAQAAAAEmAQAAAAUnAQAAAAUoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAiACEtAQAAAAEuAQAAAAEvAQAAAAELFQAAIAAgGAAAIQAgGQAAIQAgJUAAAAABJkAAAAAEJ0AAAAAEKEAAAAABKUAAAAABKkAAAAABK0AAAAABLEAAHwAhCxUAACAAIBgAACEAIBkAACEAICVAAAAAASZAAAAABCdAAAAABChAAAAAASlAAAAAASpAAAAAAStAAAAAASxAAB8AIQglAgAAAAEmAgAAAAQnAgAAAAQoAgAAAAEpAgAAAAEqAgAAAAErAgAAAAEsAgAgACEIJUAAAAABJkAAAAAEJ0AAAAAEKEAAAAABKUAAAAABKkAAAAABK0AAAAABLEAAIQAhDhUAACMAIBgAACQAIBkAACQAICUBAAAAASYBAAAABScBAAAABSgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBACIAIS0BAAAAAS4BAAAAAS8BAAAAAQglAgAAAAEmAgAAAAUnAgAAAAUoAgAAAAEpAgAAAAEqAgAAAAErAgAAAAEsAgAjACELJQEAAAABJgEAAAAFJwEAAAAFKAEAAAABKQEAAAABKgEAAAABKwEAAAABLAEAJAAhLQEAAAABLgEAAAABLwEAAAABDhUAACAAIBgAACYAIBkAACYAICUBAAAAASYBAAAABCcBAAAABCgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBACUAIS0BAAAAAS4BAAAAAS8BAAAAAQslAQAAAAEmAQAAAAQnAQAAAAQoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAmACEtAQAAAAEuAQAAAAEvAQAAAAENFQAAIAAgFgAAKAAgFwAAIAAgGAAAIAAgGQAAIAAgJQIAAAABJgIAAAAEJwIAAAAEKAIAAAABKQIAAAABKgIAAAABKwIAAAABLAIAJwAhCCUIAAAAASYIAAAABCcIAAAABCgIAAAAASkIAAAAASoIAAAAASsIAAAAASwIACgAIQkcAAApADAdAAAEABAeAAApADAfAgAqACEgAQArACEhAQArACEiAQAsACEjQAAtACEkQAAtACEIJQIAAAABJgIAAAAEJwIAAAAEKAIAAAABKQIAAAABKgIAAAABKwIAAAABLAIAIAAhCyUBAAAAASYBAAAABCcBAAAABCgBAAAAASkBAAAAASoBAAAAASsBAAAAASwBACYAIS0BAAAAAS4BAAAAAS8BAAAAAQslAQAAAAEmAQAAAAUnAQAAAAUoAQAAAAEpAQAAAAEqAQAAAAErAQAAAAEsAQAkACEtAQAAAAEuAQAAAAEvAQAAAAEIJUAAAAABJkAAAAAEJ0AAAAAEKEAAAAABKUAAAAABKkAAAAABK0AAAAABLEAAIQAhAAAAAAAAATABAAAAAQEwAQAAAAEBMEAAAAABBTACAAAAATECAAAAATICAAAAATMCAAAAATQCAAAAAQAAAAAFFQAGFgAHFwAIGAAJGQAKAAAAAAAFFQAGFgAHFwAIGAAJGQAKAQIBAgMBBQYBBgcBBwgBCQoBCgwCCw0DDA8BDRECDhIEERMBEhQBExUCGhgFGxkL"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map