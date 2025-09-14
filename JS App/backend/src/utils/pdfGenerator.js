import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateRidesPDF(rides, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // === Header ===
      doc
        .fontSize(20)
        .text("Ride Report", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
        .moveDown(1);

      // === Table Setup ===
      const startX = 40;
      const columnWidths = {
        id: 40,
        pickup: 110,
        dropoff: 110,
        coords: 90,
        driver: 60,
        vehicle: 60,
        status: 60,
        fare: 50,
        distance: 50,
        duration: 50,
        payment: 50,
      };
      const rowHeight = 20;
      let y = doc.y;

      // Table Header
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("ID", startX, y, { width: columnWidths.id });
      doc.text("Pickup", startX + columnWidths.id, y, { width: columnWidths.pickup });
      doc.text("Dropoff", startX + columnWidths.id + columnWidths.pickup, y, { width: columnWidths.dropoff });
      doc.text("Coords", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff, y, { width: columnWidths.coords });
      doc.text("Driver", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords, y, { width: columnWidths.driver });
      doc.text("Vehicle", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords + columnWidths.driver, y, { width: columnWidths.vehicle });
      doc.text("Status", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords + columnWidths.driver + columnWidths.vehicle, y, { width: columnWidths.status });
      doc.text("Fare", startX + 440, y, { width: columnWidths.fare });
      doc.text("Dist(KM)", startX + 490, y, { width: columnWidths.distance });
      doc.text("Dur(Min)", startX + 540, y, { width: columnWidths.duration });
      y += rowHeight;

      doc.font("Helvetica").fontSize(10);

      // Table Rows
      rides.forEach((ride, i) => {
        // Alternate row shading
        if (i % 2 === 0) {
          doc.rect(startX, y - 3, 520, rowHeight).fillOpacity(0.1).fillAndStroke("#CCCCCC", "#000000");
          doc.fillColor("#000000");
        }

        // Ride data
        const coords = `${ride.pickup_latitude},${ride.pickup_longitude} → ${ride.dropoff_latitude},${ride.dropoff_longitude}`;
        doc.text(ride.id.toString(), startX, y, { width: columnWidths.id });
        doc.text(ride.pickup_address || "-", startX + columnWidths.id, y, { width: columnWidths.pickup });
        doc.text(ride.dropoff_address || "-", startX + columnWidths.id + columnWidths.pickup, y, { width: columnWidths.dropoff });
        doc.text(coords, startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff, y, { width: columnWidths.coords });
        doc.text(ride.driver_id || "-", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords, y, { width: columnWidths.driver });
        doc.text(ride.vehicle_id || "-", startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords + columnWidths.driver, y, { width: columnWidths.vehicle });
        doc.text(ride.ride_status, startX + columnWidths.id + columnWidths.pickup + columnWidths.dropoff + columnWidths.coords + columnWidths.driver + columnWidths.vehicle, y, { width: columnWidths.status });
        doc.text(ride.fare?.toFixed(2) || "-", 440, y, { width: columnWidths.fare });
        doc.text(ride.distance_km?.toFixed(2) || "-", 490, y, { width: columnWidths.distance });
        doc.text(ride.duration_minutes || "-", 540, y, { width: columnWidths.duration });
        y += rowHeight;

        // Page break
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 50;
        }
      });

      // Footer with page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).fillColor("gray").text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 30, { align: "center" });
      }

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}
