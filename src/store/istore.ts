export type GScrapRecord = {
    url: string;
    [key: string]: string
}

export interface IStore {
    insert(record: GScrapRecord): void;
    insertMany(records: GScrapRecord[]): void;
    get(url: string): GScrapRecord;
    getAll(): GScrapRecord[];
    count(): number
    exportToJson(filePath: string): void;
    importFromJson(filePath: string): Promise<void>;
    close(): void;
}