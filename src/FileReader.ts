import fs from 'fs';
import Bluebird from 'bluebird';
import { FileBase } from './FileBase';
import { NotSupportedError } from './errors';

const fsRead = Bluebird.promisify(fs.read);
const fsFstat = Bluebird.promisify(fs.fstat);

export class FileReader extends FileBase {
    public constructor(file: number | string, flags?: string) {
        super(file, flags || 'r');
    }

    public get length(): number {
        return this.stats.size;
    }

    public async refreshStats(): Promise<void> {
        this.stats = await fsFstat(this.fd);
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
        return this.readIntBE(1);
    }

    public async readUInt8(): Promise<number> {
        return this.readUIntBE(1);
    }

    public async readInt16BE(): Promise<number> {
        return this.readIntBE(2);
    }

    public async readInt16LE(): Promise<number> {
        return this.readIntLE(2);
    }

    public async readUInt16BE(): Promise<number> {
        return this.readUIntBE(2);
    }

    public async readUInt16LE(): Promise<number> {
        return this.readUIntLE(2);
    }

    public async readInt32BE(): Promise<number> {
        return this.readIntBE(4);
    }

    public async readInt32LE(): Promise<number> {
        return this.readIntLE(4);
    }

    public async readUInt32BE(): Promise<number> {
        return this.readUIntBE(4);
    }

    public async readUInt32LE(): Promise<number> {
        return this.readUIntLE(4);
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
