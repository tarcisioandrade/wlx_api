import { randomUUID } from "crypto";
import jimp from "jimp";


async function imageBuilder(buffer: Buffer) {
  const newName = `${randomUUID()}.jpg`;
  const tmpImage = await jimp.read(buffer);

  tmpImage
    .cover(500, 500)
    .quality(80)
    .write(`./public/assets/images/${newName}`);

  return newName;
}

export default imageBuilder;