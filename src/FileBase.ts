import fs from 'fs';
import Bluebird from 'bluebird';

const fsOpen = Bluebird.promisify(fs.open);
const fsClose = Bluebird.promisify(fs.close);

export abstract class FileBase {
    public fd: number;
    public flags: string;
    public stats: fs.Stats;
    public pointer: number = 0;
    public file: number | string;

    public constructor(file: number | string, flags: string) {
        this.file = file;
        this.flags = flags;
    }

    public async init(): Promise<void> {
        if (typeof this.file === 'number') {
            this.fd = this.file;
        } else {
            this.fd = await fsOpen(this.file, this.flags);
        }

        return this.refreshStats();
    }

    public async destroy(): Promise<void> {
        if (typeof this.file !== 'number' && typeof this.fd === 'number') {
            await fsClose(this.fd);
        }

        this.fd = this.file = -1;
    }

    public offset(size: number): this {
        this.pointer += size;
        return this;
    }

    public setPointer(pointer: number): this {
        this.pointer = pointer;
        return this;
    }

    abstract get length(): number;
    abstract refreshStats(): Promise<void>;
}
