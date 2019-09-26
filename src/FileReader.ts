import fs from 'fs';
import Bluebird from 'bluebird';
import { NotSupportedError } from './errors';

const fsOpen = Bluebird.promisify(fs.open);
const fsRead = Bluebird.promisify(fs.read);
const fsClose = Bluebird.promisify(fs.close);
const fsFstat = Bluebird.promisify(fs.fstat);

export class FileReader {
    public fd: number;
    public flags: string;
    public stats: fs.Stats;
    public pointer: number = 0;
    public file: number | string;

    public constructor(file: number | string, flags?: string) {
        this.file = file;
        this.flags = flags || 'r';
    }

    public get length(): number {
        return this.stats.size;
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
    }

    public offset(size: number): this {
        this.pointer += size;
        return this;
    }

    public isReadable(size: number): boolean {
        return this.stats.size - this.pointer >= size;
    }

    public async read(size: number): Promise<Buffer> {
        if (!this.isReadable(size)) {
            throw new Error('Not enough data to read!');
        }

        const result = Buffer.allocUnsafe ? Buffer.allocUnsafe(size) : new Buffer(size);
        const bytesRead = await fsRead(this.fd, result, 0, size, this.pointer);

        if (size !== bytesRead) {
            throw new Error('"size" and "bytesRead" do not match!');
        }

        this.pointer += size;
        return result;
    }

    public async readString(size: number, encoding?: BufferEncoding): Promise<string> {
        return (await this.read(size)).toString(encoding);
    }

    public async readIntBE(size: number): Promise<number> {
        return (await this.read(size)).readIntBE(0, size);
    }

    public async readIntLE(size: number): Promise<number> {
        return (await this.read(size)).readIntLE(0, size);
    }

    public async readUIntBE(size: number): Promise<number> {
        return (await this.read(size)).readUIntBE(0, size);
    }

    public async readUIntLE(size: number): Promise<number> {
        return (await this.read(size)).readUIntLE(0, size);
    }

    public async readInt8(): Promise<number> {
        return (await this.read(1)).readInt8(0);
    }

    public async readUInt8(): Promise<number> {
        return (await this.read(1)).readUInt8(0);
    }

    public async readInt16BE(): Promise<number> {
        return (await this.read(2)).readInt16BE(0);
    }

    public async readInt16LE(): Promise<number> {
        return (await this.read(2)).readInt16LE(0);
    }

    public async readUInt16BE(): Promise<number> {
        return (await this.read(2)).readUInt16BE(0);
    }

    public async readUInt16LE(): Promise<number> {
        return (await this.read(2)).readUInt16LE(0);
    }

    public async readInt32BE(): Promise<number> {
        return (await this.read(4)).readInt32BE(0);
    }

    public async readInt32LE(): Promise<number> {
        return (await this.read(4)).readInt32LE(0);
    }

    public async readUInt32BE(): Promise<number> {
        return (await this.read(4)).readUInt32BE(0);
    }

    public async readUInt32LE(): Promise<number> {
        return (await this.read(4)).readUInt32LE(0);
    }

    public async readInt64BE(): Promise<bigint> {
        if (!Buffer.prototype.readBigInt64BE) {
            throw new NotSupportedError('readInt64BE not supported!');
        }

        return (await this.read(8)).readBigInt64BE(0);
    }

    public async readInt64LE(): Promise<bigint> {
        if (!Buffer.prototype.readBigInt64LE) {
            throw new NotSupportedError('readInt64LE not supported!');
        }

        return (await this.read(8)).readBigInt64LE(0);
    }

    public async readUInt64BE(): Promise<bigint> {
        if (!Buffer.prototype.readBigUInt64BE) {
            throw new NotSupportedError('readUInt64BE not supported!');
        }

        return (await this.read(8)).readBigUInt64BE(0);
    }

    public async readUInt64LE(): Promise<bigint> {
        if (!Buffer.prototype.readBigUInt64LE) {
            throw new NotSupportedError('readUInt64LE not supported!');
        }

        return (await this.read(8)).readBigUInt64LE(0);
    }

    public async readFloatBE(): Promise<number> {
        return (await this.read(4)).readFloatBE(0);
    }

    public async readFloatLE(): Promise<number> {
        return (await this.read(4)).readFloatLE(0);
    }

    public async readDoubleBE(): Promise<number> {
        return (await this.read(8)).readDoubleBE(0);
    }

    public async readDoubleLE(): Promise<number> {
        return (await this.read(8)).readDoubleLE(0);
    }
}
