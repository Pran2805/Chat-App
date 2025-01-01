import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import avatar from "../public/avatar.png"
import { formatMessageTime } from '../utils/formatMessageTime'

function ChatContainer() {
    const {messages, getMessages, isMessagesLoading, selectedUser, listenToMessages, notToListenMessages}= useChatStore()
    const{authUser}= useAuthStore()
    useEffect(() => {
      getMessages(selectedUser._id)
      // console.log('messages:' ,messages)
      listenToMessages()
      return()=>{
        notToListenMessages()
      }
    }, [selectedUser._id, getMessages])
    
    // console.log(messages);
    
    if( isMessagesLoading) return <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
    </div>
  return (
    <>
     <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages && messages.map((message , index)=>(
            <div key={message._id || index}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className='chat-image avatar'>
                <div className='size-10 rounded-full border'>
                    <img src={message.senderId === authUser._id ? authUser.avatar || avatar : selectedUser.avatar || avatar} alt="avatar" />
                </div>
              </div>
              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50 ml-1'>
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {/* {console.log(message.image)} */}
                {console.log(message.text)}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
            </div>
          ))}
        </div>
        <MessageInput />
        </div> 
    </>
  )
}

export default ChatContainer
