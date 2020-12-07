---
title: '3D_Face_Reconstruction'
createdDate: '2020-07-11'
updatedDate: '2020-07-11'
author: Davis Du
tags:
  - project
image: image41.png
draft: false
---


**Abstract:** 
In this work we propose a  model-based deep convolutional autoencoder  to reconstruct three-dimensional(3D) face by a two-dimensional(2D) human face image. Firstly, detecting the face region of the input face image and extract the face region. Using extracted face region as input to calculate the coefficients of BFM 3D face object through the trained neural network. Using the coefficients to reconstruct a 3D human face object through BFM(Basel Face Model). Our model can be trained end-to-end in an unsupervised manner, which renders training on very large (unlabeled) real world data. Our training process is achieved by encoding reconstructed 3D face to 2D predict faces, update network by calculate loss of the true human faces and their predicted 2D face images.

### **I.FACE DETECTION**
In this part, we used CACD 2000 dataset(Cross-Age Celebrity Dataset, which contains more than 160,000 images of 2,000 celebrities with age ranging from 16 to 62) and Dlib(a popular cross-platform software library for image processing) to generate our training image set.

The process consists of the following phases:

#### A. Get the clip
The first phase is to detect and get the human facial part in an image. The facial landmark detector and the predictor ('shape_predictor_68_face_landmarks.dat') inside the dlib library is a trained network, which can recognize and detect the 68 facial feature points in an image.[4] Using the 68 facial feature points, we can locate the face in an image and cut that portion as a clip, with the desired size.
![Image11](//3DFaceReconstruction//image11.png)

#### B. Mask the Clip
The second step is to mask the unnecessary part around the face in the clip. The key is using the facial feature points to determine the boundary between the human face and the surroundings. Here we used another facial landmark detector(shape_predictor_81_face_landmarks.dat), which can detect human faces and predict 81 facial feature points to locate the coordinate of facial feature points in a clip. With those coordinates, we can define the convex hull to contain the facial part and the outside will be masked using functions in OpenCV.
![Image12](//3DFaceReconstruction//image12.png)

To enhance the quality of training, here we used the model which could detect 81 facial feature points to determine the facial boundary, including the forehead part. While the official 68-point detector can only show the facial part under the eyebrow.
![Image13](//3DFaceReconstruction//image13.png)

#### C.Generate Training Set
Execute step 1 and step 2 for every image in CACD 2000 dataset to generate the training image set. 10,563 images were generated for training.

### **II.FACE MODEL RESTRUCTION**
#### A.Basel Face Model
Basel Face Model is an open source human face database. The basic principle is 3DMM, an 3D human face object can be reconstructed according to its face shape and emotion and face texture. The data of BFM is stored in a PCA form, an average face shape and PCA components of shape and emotions. An average face texture and PCA components of face texture.
![Image21](//3DFaceReconstruction//image21.png)
![Image22](//3DFaceReconstruction//image22.png)

#### B.3D Face Construction 
In order to construct a 3D face object, we need to know shape and expression of the face, texture of the face and vertices. The first step is to use the following equation to calculate the face shape. 
![Image23](//3DFaceReconstruction//image23.png)

Se is the average face shape in BFM, si and ei is the PCA components of face shape and emotion. And αi , βi are the parameters which were calculated by the residual neural networks. 

The second step is to calculate the face texture according to the following equation:
![Image24](//3DFaceReconstruction//image24.png)

Te is the average face texture and ti is the PCA components of texture.. And i is the parameters from ResNet. 

Vertices are the points of an face model, which is stored in the Basel Face Model, so we can read it directly from the data set. 

Then we find a image and its coefficients from the internet. Using the coefficients to reconstruct its 3D face model. Here is the result. 
![Image25](//3DFaceReconstruction//image25.png)

#### C.Spherical Harmonic Lighting
Spherical is used for rapid simulation of complex lighting. We use it to makes the constructed face object looks more vivid. We use the ResNet to calculate 27parameters gamma, 9 for each channel.  The following picture shows the result without and with lighting. 
![Image26](//3DFaceReconstruction//image26.png)

### **III.NEURAL NETWORK**
In this part, we build our residual network. Using the extracted face image as input and using the projected 3D human face image to train the network. 

#### A.ResNet50 
Residual neural networks can skip connections, or shortcut to jump over some layers. This make ResNet can avoid the problem of vanishing gradients, by reusing activation from a previous layer until the adjacent layer learns its weights.

In this paper, we are using ResNet-50, it’s a deep convolutional neural network with 50 layers.The input of our network is a 200*200 RGB human face image. The output is an 1*230 tensor that contains coefficients of BFM and parameters of image projection set

#### B.Project 3D object to 2D image 
We firstly split output tensor to get Basel Face model’s coefficients: shape, expression and texture, then we can use them to reconstructed human face object. 

Since we can’t directly compute the loss between original true face images and reconstructed human face object, we need to project the 3D face object onto a plane to get RGB image with size 200*200. 

We use a virtual camera called soft_render(reference), which can generate a projection of the 3D object while keep its gradient traceable. Firstly we set the distance of the camera to 3D face to 3. The initial position of the camera is in front of the 3D human face. Then we  use two output parameters elevation and azimuth, which are split from the ResNet output tensor. These two parameters are used to decide the  angles of  camera in horizontal and in vertical. Here is the result :
![Image31](//3DFaceReconstruction//image31.png)

While we calculate the loss between the projected and input image, we find that the loss is much larger than real loss since the position of the projected image is different from that of the real face image. 

So we make a copy of the projected image and transfer the copy to numpy array. Then use dlib to detect its landmark points. In the data preparation stage, we already got the landmark points of input original face images. By using the landmark points of projected image and landmark points of input image, we can calculate the matrix of affine transformation. Then we can use the matrix to do affine transform to the projected image. As a result, we get the transformed image which is aligned with original picture.
![Image32](//3DFaceReconstruction//image32.png)

#### C.Training the Net
We use mean square loss as the loss function to calculate the loss of  the transformed image and the original face images. Since we set all the data as tensor, all the steps’ gradients are traceable. We use up to 10563 images to train our network. Each training set contains 5000 images. For each training set we run 10 epochs. In order to train the net, we run 50 epochs about 20 hours. Firstly,the loss of the net is around 0.5 and decrease to 0.03 and flip around it. It means that the increase of similarity between predict image and input image.

### **RESULT**
#### A.Result 
We extract human faces in CACD 2000 dataset as train data to train our residual neural network, and then use the net to generate the parameters for BFM and get an related 3D face object. Then project the 3D object to a 2D image as output. Using the projected and real human face image to calculate the mean square loss, and update the residual neural network. Here is the result of the whole project, the input are ourselves:
![Image41](//3DFaceReconstruction//image41.png)
![Image42](//3DFaceReconstruction//image42.png)
![Image43](//3DFaceReconstruction//image43.png)

#### B.Weakness
The project still have some disadvantages can be improved. Firstly, we could warp projected face image by facial features separately(eye, nose, lips), but we warp the whole image in our project, so projected face image and true_face image are not exactly corresponded.

 Secondly, we found that as the training time increasing, the generate projected face gradually become similar, the loss is hard to decrease. We could fully use the BFM, since we only use part of the vertices of the face model to reduce the training time.  

 The final result is not as good as those net that using 3D object to train. Our model need further improvement.

[GitHubLink](https://github.com/DavisDDD/3DFaceReconstruction)
