import os
from imageai.Classification import ImageClassification

cwd = os.getcwd()
images_dir = os.path.join(cwd, "../tmp/images")
models_dir = os.path.join(cwd, "models")

prediction = ImageClassification()
prediction.setModelTypeAsResNet50()
prediction.setModelPath(os.path.join(execution_path, "resnet50_imagenet_tf.2.0.h5"))
prediction.loadModel()

for filename in os.listdir(images_dir):
    f = os.path.join(images_dir, filename)

    predictions, probabilities = prediction.classifyImage(f, result_count=10 )
    for eachPrediction, eachProbability in zip(predictions, probabilities):
        print(eachPrediction , " : " , eachProbability)
