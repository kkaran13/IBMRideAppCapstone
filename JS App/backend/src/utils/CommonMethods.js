import dayjs from "dayjs";
import fs from "fs";
import archiver from "archiver";

class CommonMethods {
  // Splits a date range into chunks of days (default 7)
  static splitDateRanges(startDate, endDate, chunkDays = 7) {
    const ranges = [];
    let start = dayjs(startDate);
    const end = dayjs(endDate);

    while (start.isBefore(end)) {
      const next = start.add(chunkDays, "day");
      ranges.push({
        start: start.toDate(),
        end: next.isBefore(end) ? next.toDate() : end.toDate(),
      });
      start = next;
    }
    return ranges;
  }

  // Creates a zip file from an array of file paths
  static async createZipFromFiles(files, zipPath) {
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

}

export default CommonMethods;
