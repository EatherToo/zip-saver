import BufferDataView from './BufferDataView'
import Crc32 from './Crc32'

export interface ZipSubFileHelperInitOptions {
  name: string
  compressionMethod?: number
  isDir?: boolean
  comment?: string
  compressedLength?: number
  uncompressedLength?: number
  originBlob?: Blob
  lastModified?: number
}

export default class ZipSubFileHelper {
  name: string
  level: number
  isDir: boolean
  comment: string
  compressedLength: number
  uncompressedLength: number
  originBlob?: Blob
  lastModified: number
  extraFiledLength?: number
  extraFiled?: Uint8Array
  localFileHeader: BufferDataView
  dataDescriptor?: BufferDataView

  private crc = new Crc32()
  private fileData = new Uint8Array()

  private offset: number = 0
  getOffset(): number {
    if (!this.closed) {
      throw new Error('this file is not ready')
    }

    return this.offset
  }

  constructor(options: ZipSubFileHelperInitOptions) {
    this.name = options.name.trim()
    this.level = options.compressionMethod || 0
    this.isDir = options.isDir || false
    this.comment = options.comment || ''
    this.compressedLength = options.compressedLength || 0
    this.uncompressedLength = options.uncompressedLength || 0
    this.originBlob = options.originBlob
    this.lastModified = options.lastModified || Date.now()
    this.localFileHeader = this.generateHeader()
  }

  private generateHeader() {
    // All multi-byte values in the header are stored in little-endian byte order.
    // All length fields count the length in bytes.
    const nameBuffer = new TextEncoder().encode(this.name)

    const localFileHeader = new BufferDataView(30 + nameBuffer.length)
    // signature
    localFileHeader.setUint32(0, 0x04034b50)
    // version needed to extract
    localFileHeader.setUint16(4, 0x0014)
    // general purpose bit flag: use UTF-8 encoding and no crc32 in the header
    // and no compression infos in the header
    localFileHeader.setUint16(6, 0x0808)
    // no compression
    localFileHeader.setUint16(8, 0)

    const date = new Date(this.lastModified || Date.now())

    // last modified time
    localFileHeader.setUint16(
      10,
      (date.getUTCHours() << 11) |
        (date.getUTCMinutes() << 5) |
        (date.getUTCSeconds() / 2)
    )

    // last modified date
    localFileHeader.setUint16(
      12,
      date.getUTCDate() |
        ((date.getUTCMonth() + 1) << 5) |
        ((date.getUTCFullYear() - 1980) << 9)
    )

    // filename length

    localFileHeader.setUint16(26, nameBuffer.length)

    // filename
    localFileHeader.setBuffer(30, nameBuffer)
    this.localFileHeader = localFileHeader
    this.offset = 30 + nameBuffer.length
    return localFileHeader
  }

  getCompressedData(data: Uint8Array) {
    return data
  }

  append(originData: Uint8Array) {
    const compressedData = this.getCompressedData(originData)
    this.crc.append(originData)
    this.offset += compressedData.length
    this.compressedLength += compressedData.length
    this.uncompressedLength += originData.length
    this.fileData = new Uint8Array([...this.fileData, ...compressedData])
  }

  private generateDataDescriptor() {
    const dataDescriptor = new BufferDataView(16)
    dataDescriptor.setUint32(0, 0x08074b50)
    this.localFileHeader.setUint32(14, this.crc.value)
    this.localFileHeader.setUint32(18, this.compressedLength)
    this.localFileHeader.setUint32(22, this.uncompressedLength)
    dataDescriptor.setUint32(4, this.crc.value)
    dataDescriptor.setUint32(8, this.compressedLength)
    dataDescriptor.setUint32(12, this.uncompressedLength)
    this.dataDescriptor = dataDescriptor
    this.offset += 16
  }

  private closed = false
  private finish() {
    if (this.closed) {
      throw new Error('this file is already closed')
    }
    this.generateDataDescriptor()
    this.closed = true
  }

  async factory() {
    if (this.closed) {
      throw new Error('this file is already closed')
    }
    if (!this.originBlob) {
      throw new Error('this file is empty')
    }
    this.append(new Uint8Array(await this.originBlob.arrayBuffer()))
    this.finish()
    return this
  }

  closeStream() {
    if (this.closed) {
      throw new Error('this file is already closed')
    }

    this.finish()
    return this.dataDescriptor!
  }

  getUint8() {
    if (!this.closed || !this.dataDescriptor) {
      throw new Error('this file is not ready')
    }
    return new Uint8Array([
      ...this.localFileHeader.getUint8(),
      ...this.fileData,
      ...this.dataDescriptor.getUint8(),
    ])
  }
}
