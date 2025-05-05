import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { getMessageType } from "../utils/fileupload.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message, senderName} = req.body;
        const file = req.file;

        // Validate required fields
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Sender and receiver IDs are required" });
        }

        if (!senderName) {
            return res.status(400).json({ message: "Sender name is required" });
        }

        // // Log request details for debugging
        // console.log("Request details:", {
        //     senderId,
        //     receiverId,
        //     message,
        //     senderName,
        //     file: file ? {
        //         filename: file.filename,
        //         mimetype: file.mimetype,
        //         size: file.size,
        //         originalname: file.originalname
        //     } : null
        // });

        // Validate file if present
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                // Delete the uploaded file if it exceeds size limit
                const filePath = path.join(__dirname, '..', 'uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(413).json({ message: "File size exceeds 10MB limit" });
            }

            // Validate file type
            const allowedTypes = {
                'image/jpeg': true,
                'image/png': true,
                'image/gif': true,
                'audio/mpeg': true,
                'audio/wav': true,
                'audio/ogg': true,
                'application/pdf': true,
                'application/msword': true,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
                'application/vnd.ms-excel': true,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true
            };

            if (!allowedTypes[file.mimetype]) {
                // Delete the uploaded file if type is not allowed
                const filePath = path.join(__dirname, '..', 'uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(415).json({ message: "Unsupported file type" });
            }
        }

        let gotConversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]},
        });

        if(!gotConversation){
            gotConversation = await Conversation.create({
                participants:[senderId, receiverId]
            });
        }

        let newMessage;
        if (file) {
            // Handle file upload
            const fileUrl = `/uploads/${file.filename}`;
            
            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '..', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            try {
                newMessage = await Message.create({
                    senderId,
                    receiverId,
                    message: message || undefined, // Use `undefined` if `message` is empty
                    messageType: getMessageType(file),
                    fileUrl,
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: file.mimetype,
                    senderName
                });

                console.log("Created file message:", newMessage);
            } catch (error) {
                // Clean up the uploaded file if message creation fails
                const filePath = path.join(__dirname, '..', 'uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                throw error;
            }
        } else {
            // Handle text message
            if (!message || !message.trim()) {
                return res.status(400).json({ message: "Message cannot be empty" });
            }
            newMessage = await Message.create({
                senderId,
                receiverId,
                message,
                messageType: 'text',
                senderName
            });


            // console.log("Created text message:", newMessage);
        }

        if(!newMessage) {
            return res.status(500).json({ message: "Failed to create message" });
        }

        gotConversation.messages.push(newMessage._id);
        await gotConversation.save();
         
        // SOCKET IO
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            newMessage,
            message: "Message sent successfully"
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ 
            message: "Internal server error while sending message",
            error: error.message,
            stack: error.stack
        });
    }
}

export const getMessage = async (req,res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;

        if (!receiverId || !senderId) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const conversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]}
        }).populate("messages"); 

        if (!conversation) {
            return res.status(200).json([]);
        }

        return res.status(200).json(conversation.messages);
    } catch (error) {
        console.error("Error in getMessage:", error);
        return res.status(500).json({ 
            message: "Internal server error while fetching messages",
            error: error.message 
        });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.id;

        // Find the message
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Delete file from uploads directory if it exists
        if (message.fileUrl) {
            const filePath = path.join(__dirname, '..', message.fileUrl);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error("Error deleting file:", error);
                // Continue with message deletion even if file deletion fails
            }
        }

        // Find the conversation and remove the message ID
        const conversation = await Conversation.findOne({
            messages: messageId
        });

        if (conversation) {
            conversation.messages = conversation.messages.filter(
                msgId => msgId.toString() !== messageId
            );
            await conversation.save();
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Notify other users about the deleted message
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", messageId);
        }

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error in deleteMessage:", error);
        return res.status(500).json({ 
            message: "Internal server error while deleting message",
            error: error.message 
        });
    }
}