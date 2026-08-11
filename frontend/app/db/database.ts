import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// ============================================================
// PRISMA CLIENT SINGLETON (Primary Database)
// ============================================================

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// ============================================================
// LEGACY JSON DATABASE (kept for backward compatibility)
// ============================================================

export const DB_PATH = path.join(process.cwd(), 'database.json');

// Interface exactly matching our Prisma schema plan
export interface DatabaseSchema {
    donors: any[];
    hospitals: any[];
    inventory: any[];
    recipients: any[];
    emergencyRequests: any[];
}

const defaultDB: DatabaseSchema = {
    donors: [],
    hospitals: [
        { id: '1', name: 'City Central Hospital', inventory: [] }
    ],
    inventory: [
        { id: '1', hospitalId: '1', bloodGroup: 'A+', units: 45, status: 'Healthy' },
        { id: '2', hospitalId: '1', bloodGroup: 'O-', units: 3, status: 'Critical' }
    ],
    recipients: [],
    emergencyRequests: []
};

// Initialize DB safely
export function getDb(): DatabaseSchema {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
        return defaultDB;
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
        return defaultDB;
    }
}

export function saveDb(data: DatabaseSchema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
