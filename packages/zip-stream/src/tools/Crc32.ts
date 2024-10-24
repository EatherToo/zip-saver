export default class Crc32 {
  constructor() {
    this.crc = -1
  }

  private crc: number

  static table: number[] = (() => {
    let table = new Array<number>(256)
    for (let i = 0; i < 256; i++) {
      let crc = i
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
      }
      table[i] = crc
    }
    return table
  })()

  append(data: Uint8Array): void {
    let crc = this.crc | 0
    let table = Crc32.table
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff]
    }
    this.crc = crc
  }

  get value(): number {
    return ~this.crc
  }
}
