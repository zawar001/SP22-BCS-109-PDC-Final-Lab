const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "image.proto");

// Load proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// 👇 THIS IS THE IMPORTANT FIX
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const imageProto = protoDescriptor.imageclassifier;

// Fake AI classification
function uploadImage(call, callback) {
  console.log(
    "Received image size:",
    call.request.imageData.length,
    "bytes"
  );

  callback(null, {
    label: "cat",
    confidence: 0.92,
  });
}

// Create server
const server = new grpc.Server();

server.addService(imageProto.ImageClassifier.service, {
  UploadImage: uploadImage,
});

// Start server
const PORT = "127.0.0.1:9000";
server.bindAsync(
  PORT,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC Server running at", PORT);
    server.start();
  }
);
