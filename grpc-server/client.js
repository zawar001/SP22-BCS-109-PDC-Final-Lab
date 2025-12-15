const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "image.proto");

// Load proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).imageclassifier;

// Create client
const client = new proto.ImageClassifier(
  "127.0.0.1:9000",
  grpc.credentials.createInsecure()
);

// Read image as binary (place any image here)
const imagePath = path.join(__dirname, "sample.jpg");

// ⚠️ If you don’t have an image yet:
if (!fs.existsSync(imagePath)) {
  console.error("Please add sample.jpg in grpc-server folder");
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);

// Measure latency
const start = process.hrtime.bigint();

client.UploadImage({ imageData: imageBuffer }, (err, response) => {
  const end = process.hrtime.bigint();

  if (err) {
    console.error("gRPC Error:", err);
    return;
  }

  const latencyMs = Number(end - start) / 1e6;

  console.log("=== gRPC RESPONSE ===");
  console.log("Label:", response.label);
  console.log("Confidence:", response.confidence);
  console.log("Latency:", latencyMs.toFixed(2), "ms");
  console.log("Payload Size:", imageBuffer.length, "bytes");
});
