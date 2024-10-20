import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

//send all messages
export const sendMessage = async(req,res)=>{
    try{
        const senderId = req.id
        const receiverId = req.params.id
        const {textMessage:message} = req.body

        let conversation = await Conversation.findOne({participants: {$all: [senderId, receiverId]}})

        //establishing a conversation if not started yet
        if(!conversation){
            conversation = await Conversation.create({participants: [senderId, receiverId]})
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        if(newMessage) conversation.messages.push(newMessage._id);
        await Promise.all([newMessage.save(), conversation.save()])

        //implement socket.io for real time chat
        const receiverSocketId = getRecieverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(200).json({success: true, newMessage: "Message sent successfully"})
    }
    catch(error){
        console.log(error)
    }
}   

//get all messages
export const getMessages = async(req,res)=>{
    try {
        const senderId = req.id
        const receiverId = req.params.id
        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        }).populate('message')
        if(!conversation) return res.status(200).json({success: true, messages: []})
            return res.status(200).json({success: true, messages: conversation?.messages})
    } catch (error) {
        console.log(error)
        
    }
}     