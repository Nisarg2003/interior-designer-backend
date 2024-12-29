import crypto from 'crypto'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import postModel from '../Model/postModel.js';
import dotenv from 'dotenv'

dotenv.config()
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
})

export const createPost = async (req, res) => {
    try {
        const uploadedFiles = [];

        if (req.files['thumbnail']) {
            const thumbnailFile = req.files['thumbnail'][0];
            const thumbnailFileName = generateFileName();

            const thumbnailParams = {
                Bucket: bucketName,
                Body: thumbnailFile.buffer,
                Key: thumbnailFileName,
                ContentType: thumbnailFile.mimetype,
            };
            // Uploading Thumbnail for Post.
            await s3.send(new PutObjectCommand(thumbnailParams));
            uploadedFiles.push({
                fileName: thumbnailFileName
            });
        }

        if (req.files['photos']) {
            for (const photo of req.files['photos']) {
                const photoFileName = generateFileName();

                const photoParams = {
                    Bucket: bucketName,
                    Body: photo.buffer,
                    Key: photoFileName,
                    ContentType: photo.mimetype,
                };
                // Uploading Images for Post 
                await s3.send(new PutObjectCommand(photoParams));
                const photoUrl = `https://${bucketName}.s3.amazonaws.com/${photoFileName}`;
                uploadedFiles.push({
                    fileName: photoFileName
                });
            }
        }
        const newPost = new postModel({
            title: req.body.title || 'Untitled Post',
            description: req.body.description || '',
            category: req.body.category,
            price: req.body.price,
            files: uploadedFiles,
        });
        await newPost.save();
        res.status(200).json({
            message: 'Files uploaded successfully!',
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Error uploading files', error });
    }
};
const generateSignedUrl = async (fileName) => {
    try {
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName
            }),
            { expiresIn: 60 * 60 * 24 }
        );
        return url;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return null;
    }
};

export const getPost = async (req, res) => {
    try {
        const posts = await postModel.find().sort({ createdAt: -1 });

        for (let post of posts) {
            for (let file of post.files) {
                const signedUrl = await generateSignedUrl(file.fileName);
                file.url = signedUrl; 
            }
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

export const findPostByCategoty = async(req,res) => {
    try {
        const {categories} = req.body;

        if (!Array.isArray(categories) || categories.length === 0 || !categories) {
            const posts = await postModel.find().sort({ createdAt: -1 });

            for (let post of posts) {
                for (let file of post.files) {
                    const signedUrl = await generateSignedUrl(file.fileName);
                    file.url = signedUrl; 
                }
            }
            return res.status(200).json(posts);
        }

        const posts = await postModel.find({ category: { $in: categories } }).sort({ createdAt: -1 });
        for (let post of posts) {
            for (let file of post.files) {
                const signedUrl = await generateSignedUrl(file.fileName);
                file.url = signedUrl; 
            }
        }
        res.status(200).json(posts);

    } catch (error) {
        console.error('Error fetching posts By Categories:', error);
        res.status(500).json({ message: 'Error fetching posts By Categories' });
    }
}

export const findPostById = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(404).json({message:'Id not Found'});
        }
        const post = await postModel.findById({_id: id});
        for (let file of post.files) {
            const signedUrl = await generateSignedUrl(file.fileName);
            file.url = signedUrl; 
        }
        res.status(200).send(post);
        
    }catch (error) {
        console.error('Error fetching posts By Id:', error);
        res.status(500).json({ message: 'Error fetching posts By Id' });
    }
}