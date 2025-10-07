import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";

export const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
    .sort({ createAt: -1 })
    .populate("user", "username profilePicture")
    .populate({
        path: "comments",
        populate: {
            path: "user",
            select: "username firtsName lastName profilePicture",
        },
    });

    res.status(200).json({ pots });

});

export const getPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId)
    .populate("user", "username firtName lastName profilePicture")
    .populate({
        path:"comments",
        populate: {
            path: "user",
            select: "username firtsName lastName profilePicture",
        },
    });

    if (!post) return res.status(404).json({ error: "Post no encontrado" });

    res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firtsName lastName profilePicture")
    .populate({
        path: "comments",
        populate: {
            path: "user",
            select: "username firtsName lastName profilePicture",
        },
    });

    res.status(200).json({ posts });
});

// Rutas privadas
export const createPost = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { content } = req.body;
    const imageFile = req.file;

    if ( !content && !imageFile ) {
        return res.status(400).json({ error: "Debes proporcionar contenido o una imagen" });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let imageUrl = "";

    // Si se proporciona una imagen, subirla a Cloudinary
    if (imageFile) {
        try {
            // convertir la imagen a base64
            const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
    
            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                folder: "social_media_posts",
                resource_type: "image",
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                    { format: "auto" },
                ],
            });
            imageUrl = uploadResponse.secure_url; 
        } catch (uploadError) {
            console.error(" Error al subir la imagen a Cloudinary:", uploadError);
            return res.status(400).json({ error: "Error al subir la imagen a Cloudinary" });
        }
    }

    const post = await Post.create({
        user: user._id,
        content: content || "",
        image: imageUrl,
    });

    res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = re.params;
    
    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) return res.status(404).json({ error: "Usuario o post no encontrado" });

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
        // unlike
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: user._id },
        });
    } else {
        // like
        await Post.findByIdAndUpdate(postId, {
            $push: { likes: user._id },
        });

        // Crear notificacion
        if (post.user.toString() !== user._id.toString()) {
            await Notification.create({
                from: user._id,
                to: post.user,
                type: "like",
                post: postId,
            });
        }
    }

    res.status(200).json({
        message: isLiked ? "Post desme gusta" : "Post me gusta",
    });
});

export const deletePost = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) return res.status(404).json({ error: "Usuario o post no encontrado" });

    if (post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este post" });
    }

    //Eliminar comentario de este post
    await comment.deleteMany({ post: postId });

    // Eliminar post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post eliminado" });
});



