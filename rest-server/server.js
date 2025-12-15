const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// gRPC client setup
const PROTO_PATH = path.join(__dirname, "image.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition);
const client = new proto.ImageClassifier(
  "localhost:50051", // AI Model Service port
  grpc.credentials.createInsecure()
);

// REST endpoint to upload images
app.post("/uploadImage", upload.array("image"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const results = [];
  const startTime = performance.now();

  for (let file of req.files) {
    const request = { imageData: file.buffer };

    try {
      const response = await new Promise((resolve, reject) => {
        client.UploadImage(request, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      results.push({
        filename: file.originalname,
        label: response.label,
        confidence: response.confidence,
      });
    } catch (err) {
      console.error("gRPC error:", err);
      results.push({
        filename: file.originalname,
        label: "error",
        confidence: 0,
      });
    }
  }

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);
  const payloadSize = new Blob([JSON.stringify(results)]).size;

  console.log(`Uploaded ${req.files.length} files | Time: ${duration} ms | Payload: ${payloadSize} bytes`);

  res.json({ results, timeMs: duration, payloadBytes: payloadSize });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`REST server running on http://localhost:${PORT}`);
});
