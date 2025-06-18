import { v2 as cloudinary } from "cloudinary";
import postModel from "../Model/postModel.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req, res) => {
  try {
    let thumbnailData = null;
    const uploadedFiles = [];

    // Upload Thumbnail
    if (req.files["thumbnail"]) {
      const thumbnailFile = req.files["thumbnail"][0];
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "thumbnails",
          },
          (error, result) => {
            if (error) return reject(error);
            thumbnailData = {
              fileName: result.public_id,
              url: result.secure_url,
            };
            resolve();
          }
        );
        uploadStream.end(thumbnailFile.buffer);
      });
    }

    // Upload Photos
    if (req.files["photos"]) {
      for (const photo of req.files["photos"]) {
        await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "photos",
            },
            (error, result) => {
              if (error) return reject(error);
              uploadedFiles.push({
                fileName: result.public_id,
                url: result.secure_url,
              });
              resolve();
            }
          );
          uploadStream.end(photo.buffer);
        });
      }
    }

    const newPost = new postModel({
      title: req.body.title || "Untitled Post",
      description: req.body.description || "",
      category: req.body.category,
      price: req.body.price,
      thumbnail: thumbnailData,
      files: uploadedFiles,
    });
    await newPost.save();

    return res.status(200).send(newPost);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in creating post", error: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const posts = await postModel.find().sort({ createdAt: -1 });

    if (!posts) {
      return res.status(400).send({ message: "No posts found" });
      s;
    }

    return res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).send({ message: "Error fetching posts" });
  }
};

export const findPostByCategoty = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0 || !categories) {
      const posts = await postModel.find().sort({ createdAt: -1 });

      return res.status(200).send(posts);
    }

    const posts = await postModel
      .find({ category: { $in: categories } })
      .sort({ createdAt: -1 });
    if (!posts || posts.length === 0) {
      return res
        .status(400)
        .send({ message: "No posts found for the categories" });
    }

    return res.status(200).send(posts);
  } catch (error) {
    console.error("Error fetching posts By Categories:", error);
    return res
      .status(500)
      .send({ message: "Error fetching posts By Categories" });
  }
};

export const findPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).send({ message: "Id not Found" });
    }
    const post = await postModel.findById({ _id: id });
    if (!post) {
      return res.status(404).send({ message: "Post not found for given ID" });
    }

    return res.status(200).send(post);
  } catch (error) {
    console.error("Error fetching posts By Id:", error);
    return res.status(500).send({ message: "Error fetching posts By Id" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categoryCounts = await postModel.aggregate([
      {
        $group: {
          _id: "$category",
          postCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          postCount: 1,
        },
      },
      {
        $sort: { postCount: -1 },
      },
    ]);
    return res.status(200).send(categoryCounts);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).send({ message: "Error fetching categories" });
  }
};

export const editPost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await postModel.findById(id);
    if (!existingPost)
      return res.status(404).json({ message: "Post not found" });

    const updateData = {
      title: req.body.title || existingPost.title,
      description: req.body.description || existingPost.description,
      category: req.body.category || existingPost.category,
      price: req.body.price || existingPost.price,
      thumbnail: existingPost.thumbnail,
      files: existingPost.files,
    };

    if (req.files["thumbnail"]) {
      if (existingPost.thumbnail?.fileName) {
        await cloudinary.uploader.destroy(existingPost.thumbnail.fileName);
      }

      const thumbnailFile = req.files["thumbnail"][0];
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "thumbnails",
          },
          (error, result) => {
            if (error) return reject(error);
            updateData.thumbnail = {
              fileName: result.public_id,
              url: result.secure_url,
            };
            resolve();
          }
        );
        uploadStream.end(thumbnailFile.buffer);
      });
    }

    if (req.files["photos"]) {
      for (const photo of req.files["photos"]) {
        await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "photos",
            },
            (error, result) => {
              if (error) return reject(error);
              updateData.files.push({
                fileName: result.public_id,
                url: result.secure_url,
              });
              resolve();
            }
          );
          uploadStream.end(photo.buffer);
        });
      }
    }

    const updatedPost = await postModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error editing post", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.thumbnail?.fileName) {
      await cloudinary.uploader.destroy(post.thumbnail.fileName);
    }

    for (const photo of post.files) {
      await cloudinary.uploader.destroy(photo.fileName);
    }

    await postModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};
