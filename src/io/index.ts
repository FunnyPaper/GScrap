import { existsSync, mkdirSync, readFileSync, writeFileSync, WriteStream } from "fs";
import { dirname } from "path";

export interface IWriteHandler<T> {
    write(obj: T): Promise<void>;
}

export type FileWriterHandlerConfig = {
    filepath: string
}

export abstract class FileWriteHandler<T> implements IWriteHandler<T> {
    protected _filepath: string;
    
    public constructor(config: FileWriterHandlerConfig) {
        this._filepath = config.filepath;
        const dirName = dirname(this._filepath);
        if(!existsSync(dirName)) {
            mkdirSync(dirName);
        }
    }

    public abstract write(obj: T): Promise<void>;
}

export class JSONFileWriteHandler extends FileWriteHandler<object> {
    private tabs?: number;
    private append: boolean;

    public constructor(config: FileWriterHandlerConfig & { tabs?: number, append?: boolean }) {
        super(config);
        this.tabs = config.tabs;
        this.append = config.append ?? true;
    }

    public async write(obj: object): Promise<void> {
        let json: unknown[];
        let result: string;

        if(this.append) {
            try {
                const content = readFileSync(this._filepath);
                json = JSON.parse(content.toString());
            } catch {
                json = [];
            }

            json.push(obj);

            result = JSON.stringify(json, null, this.tabs);
        } else {
            result = JSON.stringify(obj, null, this.tabs);
        }
        
        writeFileSync(this._filepath, result, { encoding: 'utf8', flag: 'w+' });
    }
}