import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import moment from 'moment'
import toast from 'react-hot-toast';

function Sidebar({isMenuOpen, setIsMenuOpen}) {

  const {chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token} = useAppContext();
  const [search, setSearch] = useState(""); 

  const logout = ()=> { 
    localStorage.removeItem('token'); 
    setToken(null); 
    toast.success("Logged out successfully");    
  }

  const deleteChat = async (e,chatId)=> { 
    try {
      e.stopPropagation(); 
      const confirm = window.confirm("Are you sure you want to delete this chat?"); 
      if(!confirm) return; 

      const {data} = await axios.get("/api/chat/delete", {
        params : { chatId },
        headers : { Authorization : token}
      })

      if(data.success){
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        await fetchUsersChats(); 
        toast.success(data.message); 
      }
      
    } catch (error) {
      toast.error(error.message); 
    }
  }

  return (
    <div className={`relative flex flex-col h-screen min-w-72 overflow-hidden transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>

      {/* Sidebar Background */}
      <div className='absolute inset-0 -z-10 bg-gradient-to-b from-[#f8f4ff] via-[#f0ebff] to-[#ece6ff] dark:from-[#0f0819] dark:via-[#100a1e] dark:to-[#090613]'>
        <div className='absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full bg-purple-300/25 dark:bg-purple-700/15 blur-3xl animate-pulse'/>
        <div className='absolute bottom-20 right-[-30px] w-48 h-48 rounded-full bg-blue-300/20 dark:bg-blue-700/10 blur-3xl animate-pulse' style={{animationDelay:'2s'}}/>
      </div>

      {/* Glass Panel */}
      <div className='flex flex-col flex-1 h-full p-5 border-r border-purple-200/50 dark:border-purple-500/15 backdrop-blur-2xl overflow-hidden'>

        {/* Close button (mobile) */}
        <img
          onClick={()=> setIsMenuOpen(false)}
          src={assets.close_icon}
          className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert z-20'
        />

        {/* Logo */}
        <img
          src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
          alt=""
          className='w-full max-w-44 mt-1'
        />

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className='group relative flex justify-center items-center gap-2 w-full py-2.5 mt-6
                     text-white text-sm font-semibold rounded-xl cursor-pointer overflow-hidden
                     bg-gradient-to-br from-purple-600 to-indigo-600
                     hover:from-purple-700 hover:to-indigo-700
                     dark:bg-none dark:bg-purple-500/20 dark:hover:bg-purple-500/30
                     dark:backdrop-blur-md
                     dark:border dark:border-purple-400/40 dark:hover:border-purple-400/70
                     shadow-lg shadow-purple-500/30
                     transition-all duration-300
                     hover:-translate-y-0.5 hover:shadow-purple-500/50 hover:shadow-xl
                     active:translate-y-0 active:scale-[0.98]'
        >
          {/* Shimmer sweep on hover */}
          <span className='absolute inset-0 -translate-x-full group-hover:translate-x-full
                           transition-transform duration-700 ease-in-out
                           bg-gradient-to-r from-transparent via-white/10 to-transparent
                           skew-x-12 pointer-events-none' />

          {/* Icon + label */}
          <span className='relative z-10 flex items-center gap-2'>
            <svg className='w-4 h-4 transition-transform duration-300 group-hover:rotate-90'
                 fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4'/>
            </svg>
            New Chat
          </span>
        </button>

        {/* Search Bar */}
        <div className='flex items-center gap-2 px-3 py-2.5 mt-4 rounded-xl
                        bg-white/60 dark:bg-white/5 backdrop-blur
                        border border-purple-200/60 dark:border-purple-500/20
                        focus-within:border-purple-400/70 dark:focus-within:border-purple-400/40
                        transition-all duration-200'>
          <img src={assets.search_icon} className='w-3.5 opacity-50 not-dark:invert' alt="" />
          <input
            onChange={(e)=> setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder='Search conversations...'
            className='text-xs bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200 w-full'
          />
        </div>

        {/* Recent Chats Label */}
        {chats.length > 0 && (
          <p className='mt-4 mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-purple-400/60 px-1'>
            Recent Chats
          </p>
        )}

        {/* Chat List */}
        <div className='flex-1 overflow-y-auto mt-1 space-y-1.5 pr-0.5' style={{scrollbarWidth:'thin', scrollbarColor:'#a78bfa33 transparent'}}>
          {chats
            .filter((chat) =>
              chat.messages[0]
                ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase())
                : chat.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((chat) => (
              <div
                onClick={()=> {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}}
                key={chat._id}
                className='group p-2.5 px-3 rounded-xl cursor-pointer flex justify-between items-center gap-2
                           bg-white/50 dark:bg-white/3 hover:bg-white/80 dark:hover:bg-purple-500/10
                           border border-transparent hover:border-purple-200/60 dark:hover:border-purple-500/20
                           transition-all duration-200'
              >
                <div className='flex-1 overflow-hidden'>
                  <p className='truncate text-sm text-gray-800 dark:text-gray-100 font-medium'>
                    {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 30) : chat.name}
                  </p>
                  <p className='text-xs text-gray-400 dark:text-purple-300/50 mt-0.5'>
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>
                <img
                  src={assets.bin_icon}
                  alt=''
                  className='w-3.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-pointer dark:invert shrink-0 transition-opacity duration-150'
                  onClick={e => deleteChat(e, chat._id)}
                />
              </div>
            ))}
        </div>

        {/* Divider */}
        <div className='my-3 h-px bg-gradient-to-r from-transparent via-purple-300/40 dark:via-purple-500/20 to-transparent'/>

        {/* Nav Items */}
        <div className='space-y-1.5'>

          {/* Community */}
          <div
            onClick={()=>{ navigate('/community'); setIsMenuOpen(false)}}
            className='flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer
                       hover:bg-white/70 dark:hover:bg-purple-500/10
                       border border-transparent hover:border-purple-200/50 dark:hover:border-purple-500/15
                       transition-all duration-200 group'
          >
            <div className='w-7 h-7 flex items-center justify-center rounded-lg bg-purple-100/80 dark:bg-purple-900/40'>
              <img src={assets.gallery_icon} className='w-4 not-dark:invert opacity-70 group-hover:opacity-100 transition-opacity' alt="" />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors'>Community Images</p>
          </div>

          {/* Credits */}
          <div
            onClick={()=> {navigate('/credits'); setIsMenuOpen(false)}}
            className='flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer
                       hover:bg-white/70 dark:hover:bg-purple-500/10
                       border border-transparent hover:border-purple-200/50 dark:hover:border-purple-500/15
                       transition-all duration-200 group'
          >
            <div className='w-7 h-7 flex items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-900/40'>
              <img src={assets.diamond_icon} className='w-4 dark:invert opacity-70 group-hover:opacity-100 transition-opacity' alt="" />
            </div>
            <div>
              <p className='text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors'>Credits</p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>{user?.credits ?? 0} remaining</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className='flex items-center justify-between px-3 py-2.5 rounded-xl
                          hover:bg-white/70 dark:hover:bg-purple-500/10
                          border border-transparent hover:border-purple-200/50 dark:hover:border-purple-500/15
                          transition-all duration-200'>
            <div className='flex items-center gap-3'>
              <div className='w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100/80 dark:bg-indigo-900/40'>
                <img src={assets.theme_icon} alt="" className='w-4 not-dark:invert opacity-70' />
              </div>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Dark Mode</p>
            </div>
            <label className='relative inline-flex cursor-pointer'>
              <input onChange={()=> setTheme(theme === 'dark' ? 'light' : 'dark')} type="checkbox" className='sr-only peer' checked={theme === 'dark'} />
              <div className='w-9 h-5 rounded-full bg-gray-300 dark:bg-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500 transition-all duration-300'></div>
              <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-4'></span>
            </label>
          </div>

          {/* User / Logout */}
          <div className='flex items-center gap-3 p-2.5 px-3 rounded-xl
                          bg-white/40 dark:bg-white/3
                          border border-purple-200/40 dark:border-purple-500/10
                          group cursor-pointer'>
            <div className='w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100/80 dark:bg-gray-800/60'>
              <img src={assets.user_icon} className='w-4 not-dark:invert opacity-70' alt="" />
            </div>
            <p className='flex-1 text-sm text-gray-700 dark:text-gray-300 truncate'>
              {user ? user.name : 'Login your account'}
            </p>
            {user && (
              <img
                onClick={logout}
                src={assets.logout_icon}
                className='h-4 cursor-pointer not-dark:invert opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity duration-150'
              />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Sidebar
