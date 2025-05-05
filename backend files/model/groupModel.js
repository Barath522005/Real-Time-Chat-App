import mongoose from "mongoose";

const groupModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
    groupPhoto: {
        type: String,
        default: "",
    }
}, { timestamps: true });

export const Group = mongoose.model("Group", groupModel);