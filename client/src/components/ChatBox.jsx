import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import Message from './Message';
import toast from 'react-hot-toast';

function ChatBox() {

  const containerRef = useRef(null); 

  const {selectedChat, theme, user, axios, token, setUser} = useAppContext(); 
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(false); 

  const [prompt, setPrompt] = useState(""); 
  const [mode,setMode] = useState("text"); 
  const [isPublished,setIsPublished] = useState(false); 

  const onSubmit = async (e)=> {
    try {
      e.preventDefault(); 
      if(!user) return toast("Login to send message"); 
      setLoading(true); 
      const promptCopy = prompt; 
      setPrompt(''); 
      setMessages(prev => [...prev, {role : 'user', content : prompt, timeStamp : Date.now(), isImage : false}])

      const {data} = await axios.post(`/api/message/${mode}`, {chatId : selectedChat._id, prompt, isPublished}, {headers : {Authorization : token}})

      if(data.success){
        setMessages(prev => [...prev, data.reply]);
        
        if(mode === "image"){
          setUser(prev => ({...prev, credits : prev.credits - 2})); 
        }
        else { 
          setUser(prev => ({...prev, credits : prev.credits -1})); 
        }
      }
      else { 
        toast.error(data.message)
        setPrompt(promptCopy); 
      }
    } catch (error) {
      toast.error(error.message)
    }
    finally { 
      setPrompt(""); 
      setLoading(false); 
    }
  }

  useEffect(()=> { 
    if(selectedChat){
      setMessages(selectedChat.messages); 
    }
  },[selectedChat]); 

  useEffect(()=> { 
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight, 
        behavior : "smooth", 
      })
    }
  },[messages])

  return (
    <div className='relative flex-1 flex flex-col h-screen overflow-hidden'>

      {/* Animated Background */}
      <div className='absolute inset-0 -z-10 bg-gradient-to-br from-[#f5f0ff] via-[#eef2ff] to-[#faf5ff] dark:from-[#0f0a1a] dark:via-[#130d2a] dark:to-[#0a0612]'>
        {/* Glowing orbs */}
        <div className='absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-purple-300/30 dark:bg-purple-700/20 blur-3xl animate-pulse'/>
        <div className='absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-blue-300/30 dark:bg-blue-700/20 blur-3xl animate-pulse' style={{animationDelay:'1.5s'}}/>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-3xl animate-pulse' style={{animationDelay:'3s'}}/>
      </div>

      {/* Chat Area */}
      <div
        ref={containerRef}
        className='flex-1 overflow-y-auto px-4 md:px-10 xl:px-24 2xl:px-48 pt-6 pb-4 space-y-2 scroll-smooth'
        style={{scrollbarWidth:'thin', scrollbarColor:'#a78bfa44 transparent'}}
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-4 select-none'>
            <div className='p-5 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-purple-200/60 dark:border-purple-500/20 shadow-xl shadow-purple-100/40 dark:shadow-purple-900/20'>
              <img
                src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
                alt=""
                className='w-48 sm:w-64 opacity-90'
              />
            </div>
            <p className='mt-2 text-3xl sm:text-5xl font-light text-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent'>
              Ask me anything.
            </p>
            <p className='text-sm text-gray-400 dark:text-gray-500'>Start a conversation — text or image generation</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message,index)=> <Message key={index} message={message}/>)}

        {/* Typing Indicator */}
        {loading && (
          <div className='flex items-center gap-2 py-2 px-4 w-fit rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur border border-purple-200/40 dark:border-purple-500/20 shadow-sm'>
            <div className='flex gap-1.5 items-center'>
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className='w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-bounce'
                  style={{animationDelay: `${i * 0.18}s`}}
                />
              ))}
            </div>
            <span className='text-xs text-gray-400 dark:text-gray-500 ml-1'>MindGPT is thinking...</span>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className='px-4 md:px-10 xl:px-24 2xl:px-48 pb-6 pt-2'>

        {/* Publish Toggle for Image Mode */}
        {mode === "image" && (
          <label className='flex items-center gap-2 mb-3 w-fit mx-auto cursor-pointer group'>
            <div className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center px-0.5 ${isPublished ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              onClick={()=> setIsPublished(!isPublished)}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${isPublished ? 'translate-x-4' : 'translate-x-0'}`}/>
            </div>
            <span className='text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors'>
              Publish generated image to Community
            </span>
          </label>
        )}

        {/* Input Form */}
        <form
          onSubmit={onSubmit}
          className='relative flex items-center gap-3 w-full max-w-3xl mx-auto px-4 py-3 rounded-2xl 
                     bg-white/70 dark:bg-white/5 backdrop-blur-xl 
                     border border-purple-200/70 dark:border-purple-500/25
                     shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30
                     focus-within:border-purple-400/80 dark:focus-within:border-purple-400/50
                     focus-within:shadow-purple-200/60 dark:focus-within:shadow-purple-700/30
                     transition-all duration-300'
        >
          {/* Mode Selector */}
          <select
            onChange={(e)=> setMode(e.target.value)}
            value={mode}
            className='text-xs font-medium px-3 py-1.5 rounded-lg outline-none cursor-pointer
                       bg-purple-100/80 dark:bg-purple-900/40 
                       text-purple-700 dark:text-purple-300
                       border border-purple-200/60 dark:border-purple-500/30
                       transition-colors hover:bg-purple-200/60 dark:hover:bg-purple-800/40'
            required
          >
            <option value="text">✦ Text</option>
            <option value="image">🎨 Image</option>
          </select>

          {/* Divider */}
          <div className='w-px h-5 bg-purple-200 dark:bg-purple-700/50'/>

          {/* Prompt Input */}
          <input
            onChange={(e)=> setPrompt(e.target.value)}
            value={prompt}
            type="text"
            placeholder='Type your prompt here...'
            className='flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500'
            required
          />

          {/* Send Button */}
          <button
            disabled={loading}
            type='submit'
            className='flex items-center justify-center w-9 h-9 rounded-xl 
                       bg-gradient-to-br from-purple-500 to-blue-500
                       hover:from-purple-600 hover:to-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-md shadow-purple-300/40 dark:shadow-purple-700/30
                       transition-all duration-200 hover:scale-105 active:scale-95'
          >
            <img
              src={loading ? assets.stop_icon : assets.send_icon}
              className='w-4 h-4 invert'
              alt=""
            />
          </button>
        </form>

        <p className='text-center text-xs text-gray-400 dark:text-gray-600 mt-2'>
          MindGPT can make mistakes. Consider verifying important info.
        </p>
      </div>
    </div>
  )
}

export default ChatBox
