import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
}, {
    timestamps: true
})

export const Message = mongoose.model('Message', messageSchema);