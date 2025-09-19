import sharp from "sharp";

class ImageUtils {
  async compressBase64(base64Str, quality = 70) {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    const compressedBuffer = await sharp(imgBuffer)
      .jpeg({ quality })
      .toBuffer();

    return `${compressedBuffer.toString("base64")}`;
  }
}

export default ImageUtils;