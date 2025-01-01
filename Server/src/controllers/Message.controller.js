import { Message } from "../models/Message.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

const getUsers = asyncHandler(async (req, res) => {
    const loggedUser = req.user._id;
    const users = await User.find({
        _id: { $ne: loggedUser }
    }).select("-password")
    if (!users) {
        throw new ApiError(404, "Users not Found")
    }
    res.status(200).json(
        new ApiResponse(202, users, "Users retrieved successfully")
    )
})

const getMessages = asyncHandler(async (req, res) => {
    try {
        const { id: userToChatId } = req.params; // ID of the user to chat with
        const senderId = req.user._id; // ID of the logged-in user

        // Find messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 }); // Sort by timestamp

        res.status(200).json(
            new ApiResponse(200, messages, "Messages fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

const sendMessages = asyncHandler(async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params; // ID of the receiver
        const senderId = req.user._id; // ID of the sender

        let imageUrl;
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Error uploading image to Cloudinary:", uploadError);
                throw new ApiError(500, "Failed to upload image");
            }
        }

        // Create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        // Send real-time message using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Optionally emit the message to the sender as well
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(
            new ApiResponse(201, newMessage, "Message sent successfully")
        );
    } catch (error) {
        console.error("Error sending message:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

export {
    getUsers,
    getMessages,
    sendMessages
}