import Chat from "../models/Chat";


//API Controller for create a new chat
export const createChat = async (req,res)=> {  
  try {
    const userId = req.user._id; 

    const chatData = {
      userId, 
      name : "New Chat", 
      userName : req.user.name,
      messages : []
    }

    await Chat.create(chatData); 
    res.json({success : true, message : "Chat Created"}); 
  } catch (error) {
    res.json({success: false, error : error.message});  
  }
}