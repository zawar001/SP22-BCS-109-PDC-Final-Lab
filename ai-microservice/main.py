import grpc
from concurrent import futures
import time
import image_pb2
import image_pb2_grpc
from PIL import Image
import io
import random

class ImageClassifierServicer(image_pb2_grpc.ImageClassifierServicer):
    def UploadImage(self, request, context):
        # Simulate classification
        label = random.choice(["cat", "dog", "bird"])
        confidence = round(random.uniform(0.7, 0.99), 2)
        return image_pb2.ImageResponse(label=label, confidence=confidence)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    image_pb2_grpc.add_ImageClassifierServicer_to_server(ImageClassifierServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Model Service running on port 50051...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
