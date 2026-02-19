import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, WriteStream } from "fs";
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
    private _stream: WriteStream;

    public constructor(config: FileWriterHandlerConfig & { tabs?: number }) {
        super(config);
        this._stream = createWriteStream(this._filepath, { flags: 'a' });
    }

    public async write(obj: object): Promise<void> {
        this._stream.write(JSON.stringify(obj, null, this.tabs) + '\n');
    }
}