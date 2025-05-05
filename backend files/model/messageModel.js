import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    message: {
        type: String,
        required: function () {
            return !this.fileUrl; // Make `message` required only if `fileUrl` is not present
        }
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'audio'],
        default: 'text'
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    fileType: String,
    senderName: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageModel);