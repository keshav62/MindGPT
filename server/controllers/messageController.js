
import Chat from "../models/Chat.js"; 
import User from "../models/User.js";
import imageKit from "../configs/imageKit.js";
import { GoogleGenAI } from "@google/genai";
import axios from 'axios'; 

//Text-based AI Chat Message Controller 
export const textMessageController = async (req,res) => { 
  try {
    const userId = req.user._id; 

    //Check credits 
    if(req.user.credits < 1){
      return res.json({success : false , message : "You don't have to engough credits to use this feature"}); 
    }

    const {chatId, prompt} = req.body; 

    const chat = await Chat.findOne({userId , _id : chatId}); 
    chat.messages.push({role : "user", content : prompt , timestamp : Date.now(), isImage : false});

    
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const {text} = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  // console.log(text);

    // const {choices} = await openai.chat.completions.create({
    //   model : "gemini-2.0-flash", 
    //   messages : [
    //     {role : "system" , content : "You are a helpful assistant"}, 
    //     {
    //       role : "user", 
    //       content : "Explain to me how AI works"
    //     }
    //   ]
    // }); 

    const reply = {
      role : "assistant" ,
      content : text,
      timestamp : Date.now(),
       isImage : false
      }

    chat.messages.push(reply); 
    await chat.save(); 
    await User.updateOne({_id : userId} , {$inc : {credits : -1}});
    res.json({success : true, reply}); 

  } catch (error) {
    
    res.json({success : false, message : error.message}); 
  }
}

//Image generation message controller 
export const imageMessageController = async (req,res)=> { 
  try {
    const userId = req.user._id; 
    //check credits
    if(req.user.credits < 2){
      return res.json({success : false , message : "You don't have to engough credits to use this feature"}); 
    }

    const {prompt, chatId, isPublished} = req.body; 
    //find chat 
    const chat = await Chat.findOne({userId, _id : chatId}); 
    //push user message 

    chat.messages.push({
      role : 'user', 
      content : prompt , 
      timestamp : Date.now(), 
      isImage : false
    }); 

    //Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt); 

    //Construct Imagekit AI generation URL
    const generatedImageUrl =  `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/mindgpt/${Date.now()}.png?tr=w-800,h-800`; 

    //Trigger generation by fetching from imagekit
    const aiImageResponse = await axios.get(generatedImageUrl , {responseType : 'arraybuffer'})

    //Convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"Buffer").toString('base64')}`


    console.log(imageKit);
    //Upload to ImageKit Media Libarary 
    const uploadResponse = await imageKit.upload({
      file : base64Image, 
      fileName : `${Date.now()}.png`, 
      folder : 'mindgpt'
    })

    const reply = { 
        role : 'assistant', 
        content : uploadResponse.url, 
        timestamp : Date.now(), 
        isImage : true, 
        isPublished
    }

    res.json({success : true, reply}); 

    chat.messages.push(reply); 
    await chat.save(); 

    await User.updateOne({_id : userId}, {$inc : {credits : -2}}); 

  } catch (error) {
    res.json({success : false, message : error.message}); 
  }
}

//API  to get published images 
export const getPublishedImages = async (req,res)=> { 
  try {
   const publishedImageMessages = await Chat.aggregate([
        {$unwind : "$messages"},
        {
          $match : {
            "messages.isImage" : true, 
            "messages.isPublished" : true
          }
        }, 
        {
          $project : {
            _id : 0, 
            imageUrl : "$messages.content", 
            userName : "$userName"
          }
        }
   ])

   res.json({success : true, images:  publishedImageMessages.reverse()}); 
  }catch (error) {
    res.json({success : false, message : error.message}); 
  }
}