import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";

//send all messages
export const sendMessage = async(req,res)=>{
    try{
        const senderId = req.id
        const receiverId = req.params.id
        const {message} = req.body

        let conversation = await Conversation.findOne({participants: {$all: [senderId, receiverId]}})

        //establishing a conversation if not sterted yet
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
        const conversation = await Conversation.findOne({participants: {$all: [senderId, receiverId]}})
        if(!conversation) return res.status(200).json({success: true, messages: []})
            return res.status(200).json({success: true, messages: conversation?.messages})
    } catch (error) {
        console.log(error)
        
    }
}     