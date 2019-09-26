import fs from 'fs';
import Bluebird from 'bluebird';
import { FileBase } from './FileBase';
import { NotSupportedError } from './errors';

const fsFstat = Bluebird.promisify(fs.fstat);
const fsWrite = Bluebird.promisify(fs.write) as (fd: number, buffer: Buffer, offset: number, length: number, position: number) => Promise<number>;

export class FileWriter extends FileBase {
    public fileSize: number = 0;

    public constructor(file: number | string, flags?: string) {
        super(file, flags || 'w');
    }

    public get length(): number {
        return this.fileSize;
    }

    public async refreshStats(): Promise<void> {
        this.stats = await fsFstat(this.fd);
        this.fileSize = this.stats.size;
    }

    public bufferAlloc(size: number): Buffer {
        return Buffer.allocUnsafe ? Buffer.allocUnsafe(size) : new Buffer(size);
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
        return this.write(Buffer.from ? Buffer.from(string, encoding) : new Buffer(string, encoding));
    }

    public async writeIntBE(size: number, value: number): Promise<void> {
        const buffer = this.bufferAlloc(size);
        buffer.writeIntBE(value, 0, size);
        return this.write(buffer);
    }

    public async writeIntLE(size: number, value: number): Promise<void> {
        const buffer = this.bufferAlloc(size);
        buffer.writeIntLE(value, 0, size);
        return this.write(buffer);
    }

    public async writeUIntBE(size: number, value: number): Promise<void> {
        const buffer = this.bufferAlloc(size);
        buffer.writeUIntBE(value, 0, size);
        return this.write(buffer);
    }

    public async writeUIntLE(size: number, value: number): Promise<void> {
        const buffer = this.bufferAlloc(size);
        buffer.writeUIntLE(value, 0, size);
        return this.write(buffer);
    }

    public async writeInt8(value: number): Promise<void> {
        return this.writeIntBE(1, value);
    }

    public async writeUInt8(value: number): Promise<void> {
        return this.writeUIntBE(1, value);
    }

    public async writeInt16BE(value: number): Promise<void> {
        return this.writeIntBE(2, value);
    }

    public async writeInt16LE(value: number): Promise<void> {
        return this.writeIntLE(2, value);
    }

    public async writeUInt16BE(value: number): Promise<void> {
        return this.writeUIntBE(2, value);
    }

    public async writeUInt16LE(value: number): Promise<void> {
        return this.writeUIntLE(2, value);
    }

    public async writeInt32BE(value: number): Promise<void> {
        return this.writeIntBE(4, value);
    }

    public async writeInt32LE(value: number): Promise<void> {
        return this.writeIntLE(4, value);
    }

    public async writeUInt32BE(value: number): Promise<void> {
        return this.writeUIntBE(4, value);
    }

    public async writeUInt32LE(value: number): Promise<void> {
        return this.writeUIntLE(4, value);
    }

    public async writeInt64BE(value: bigint): Promise<void> {
        const buffer = this.bufferAlloc(8);
        buffer.writeBigInt64BE(value, 0);
        return this.write(buffer);
    }

    public async writeInt64LE(value: bigint): Promise<void> {
        const buffer = this.bufferAlloc(8);
        buffer.writeBigInt64LE(value, 0);
        return this.write(buffer);
    }

    public async writeUInt64BE(value: bigint): Promise<void> {
        const buffer = this.bufferAlloc(8);
        buffer.writeBigUInt64BE(value, 0);
        return this.write(buffer);
    }

    public async writeUInt64LE(value: bigint): Promise<void> {
        const buffer = this.bufferAlloc(8);
        buffer.writeBigUInt64LE(value, 0);
        return this.write(buffer);
    }
}
