import fs from "fs";
import archiver from "archiver";

export async function createZipFromFiles(files, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(zipPath));
    archive.on("error", reject);

    archive.pipe(output);
    files.forEach((file) => archive.file(file, { name: file.split("/").pop() }));
    archive.finalize();
  });
}
