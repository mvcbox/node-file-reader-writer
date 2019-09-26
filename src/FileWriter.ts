import fs from 'fs';
import Bluebird from 'bluebird';
import { NotSupportedError } from './errors';

const fsOpen = Bluebird.promisify(fs.open);
const fsClose = Bluebird.promisify(fs.close);
const fsFstat = Bluebird.promisify(fs.fstat);
const fsWrite = Bluebird.promisify(fs.write) as (fd: number, buffer: Buffer, offset: number, length: number, position: number) => Promise<number>;

export class FileWriter {
    public fd: number;
    public flags: string;
    public stats: fs.Stats;
    public pointer: number = 0;
    public fileSize: number = 0;
    public file: number | string;

    public constructor(file: number | string, flags?: string) {
        this.file = file;
        this.flags = flags || 'w';
    }

    public get length(): number {
        return this.fileSize;
    }

    public async init(): Promise<void> {
        if (typeof this.file === 'number') {
            this.fd = this.file;
        } else {
            this.fd = await fsOpen(this.file, this.flags);
        }

        await this.refreshStats();
    }

    public async destroy(): Promise<void> {
        if (typeof this.file !== 'number' && typeof this.fd === 'number') {
            await fsClose(this.fd);
        }

        this.fd = this.file = -1;
    }

    public async refreshStats(): Promise<void> {
        this.stats = await fsFstat(this.fd);
        this.fileSize = this.stats.size;
    }

    public offset(size: number): this {
        this.pointer += size;
        return this;
    }

    public async write(data: Buffer): Promise<void> {
        const bytesWritten = await fsWrite(this.fd, data, 0, data.length, this.pointer);

        if (data.length !== bytesWritten) {
            throw new Error('"data.length" and "bytesWritten" do not match!');
        }

        this.pointer += data.length;

        if (this.pointer > this.fileSize) {
            this.fileSize = this.pointer;
        }
    }

    public async writeString(string: string, encoding?: BufferEncoding): Promise<void> {
        await this.write(Buffer.from ? Buffer.from(string, encoding) : new Buffer(string, encoding));
    }
}
