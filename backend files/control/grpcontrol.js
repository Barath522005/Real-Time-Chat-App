import { Group } from "../models/groupModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createGroup = async (req, res) => {
    try {
        const { name, members, groupPhoto } = req.body;
        const admin = req.id;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required" });
        }

        const group = await Group.create({
            name,
            admin,
            members: [...members, admin],
            groupPhoto: groupPhoto || ""
        });

        return res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== req.id) {
            return res.status(403).json({ message: "Only the group admin can add members" });
        }

        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: "User is already a member of the group" });
        }

        group.members.push(memberId);
        await group.save();

        return res.status(200).json({ message: "Member added successfully", group });
    } catch (error) {
        console.error("Error adding member:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { message } = req.body;
        const senderId = req.id;
        const file = req.file;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(senderId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Get sender's information
        const sender = await User.findById(senderId).select("fullName profilePhoto");
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }

        let messageData = {
            senderId,
            groupId,
            senderName: sender.fullName,
            messageType: 'text'
        };

        // Handle file upload
        if (file) {
            // Format file size
            const fileSize = file.size < 1024 * 1024 
                ? `${(file.size / 1024).toFixed(2)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            messageData = {
                ...messageData,
                fileUrl: `/uploads/${file.filename}`,
                fileName: file.originalname,
                fileSize: fileSize,
                fileType: file.mimetype,
                messageType: file.mimetype.startsWith('image/') ? 'image' : 'file'
            };
        }

        // Add message text if provided
        if (message) {
            messageData.message = message;
        }

        const newMessage = await Message.create(messageData);

        group.messages.push(newMessage._id);
        await group.save();

        // Include sender details in the response
        const messageWithDetails = {
            ...newMessage.toObject(),
            senderName: sender.fullName,
            senderPhoto: sender.profilePhoto
        };

        return res.status(201).json({ 
            success: true,
            message: "Message sent successfully", 
            newMessage: messageWithDetails 
        });
    } catch (error) {
        console.error("Error sending group message:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate({
                path: 'messages',
                populate: {
                    path: 'senderId',
                    select: 'fullName profilePhoto'
                }
            });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Transform messages to include sender information
        const messages = group.messages.map(msg => ({
            ...msg.toObject(),
            senderName: msg.senderId.fullName,
            senderPhoto: msg.senderId.profilePhoto
        }));

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate("members", "fullName");
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        return res.status(200).json(group);
    } catch (error) {
        console.error("Error fetching group:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.id })
            .select("name groupPhoto members")
            .populate("members", "fullName profilePhoto");
        return res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteGroupMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const userId = req.id;

        // Find the message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only allow message deletion by the sender
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Check if the message belongs to the specified group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // If message has a file, delete it from the uploads directory
        if (message.fileUrl) {
            const filePath = path.join(__dirname, '..', message.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Remove message from group's messages array
        group.messages = group.messages.filter(msgId => msgId.toString() !== messageId);
        await group.save();

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({ 
            success: true,
            message: "Message deleted successfully",
            deletedMessageId: messageId
        });
    } catch (error) {
        console.error("Error deleting group message:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};