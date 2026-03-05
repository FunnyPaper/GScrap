import sq3 from 'better-sqlite3';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';
import { GScrapRecord, IStore } from './istore.js';
import { dirname, resolve } from 'path';

export class SQLiteStore implements IStore {
    private _id: string;
    private _db: sq3.Database;

    private _insertStatement: sq3.Statement<[url: string, data: string]>;
    private _insertManyTransaction: sq3.Transaction<(params: GScrapRecord[]) => void>;
    private _getByUrlStatement: sq3.Statement<[url: string], { url: string, data: string }>;
    private _getAllStatement: sq3.Statement<[], { url: string, data: string }>;
    private _countStatement: sq3.Statement<[], { c: number }>;

    public constructor(id: string) {
        this._id = id;
        this._db = new sq3(resolve(process.cwd(), `./gscrap.${id}.sqlite`));

        this._db.exec(`
            PRAGMA journam_mode = MEMORY;
            PRAGMA synchronous = OFF;
            
            DROP TABLE IF EXISTS records;

            CREATE TABLE records (
                url TEXT PRIMARY KEY,
                data TEXT NOT NULL
            )
        `);

        this._insertStatement = this._db.prepare(`
            INSERT OR REPLACE INTO records (url, data)
            VALUES (?, ?)
        `);

        this._insertManyTransaction = this._db.transaction(records => {
            for (const record of records) {
                this.insert(record);
            }
        });

        this._getByUrlStatement = this._db.prepare(`
            SELECT data FROM records WHERE url = ?    
        `);

        this._getAllStatement = this._db.prepare(`
            SELECT data FROM records    
        `);

        this._countStatement = this._db.prepare(`
            SELECT COUNT(*) AS c FROM records    
        `);
    }

    public insert(record: GScrapRecord) {
        this._insertStatement.run(record.url, JSON.stringify(record));
    }

    public insertMany(records: GScrapRecord[]) {
        this._insertManyTransaction(records);
    }

    public get(url: string) {
        const record = this._getByUrlStatement.get(url);

        return record ? JSON.parse(record.data) : null;
    }

    public getAll(): GScrapRecord[] {
        const result = [];
        
        const records = this._getAllStatement.iterate();
        for (const record of records) {
            result.push(record ? JSON.parse(record.data) : null);
        }

        return result;
    }

    public count(): number {
        return this._countStatement.get()?.c || 0;
    }

    public exportToJson(filePath: string) {
        const absolutePath = resolve(process.cwd(), filePath);
        const directory = dirname(absolutePath);
        if(!existsSync(directory)) {
            mkdirSync(directory, { recursive: true });
        }

        const stream = createWriteStream(filePath);

        stream.write('[\n');

        const records = this._getAllStatement.iterate();

        let first = true;

        for (const record of records) {
            if (!first) stream.write(',\n');
            stream.write(record.data);
            first = false;
        }

        stream.write('\n]');
        stream.end();
    }

    public async importFromJson(filePath: string) {
        try {
            const stream = createReadStream(filePath);

            const rl = createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            const result = [];
            for await (const line of rl) {
                if (line.trim() === '') continue;

                const obj = JSON.parse(line);
                result.push(obj);
            }

            this._insertManyTransaction(result);
        } catch(e) {
            // Do nothing if path not found
        }
    }

    public close() {
        this._db.close();
    }
}