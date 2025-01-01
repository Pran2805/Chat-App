import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../utils/axios";
import {useAuthStore} from '../store/useAuthStore'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUserLoading: true });
        axiosInstance.get("/message/users")
            .then((response) => {
                // console.log(response);

                set({ users: response.data.data, isUserLoading: false });
            })
            .catch((error) => {
                console.error(error);
                toast.error("Error fetching users");
                set({ isUserLoading: false });
            })
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        
        axiosInstance.get(`/message/${userId}`)
            .then((response) => {
              // console.log("message1", response.data.data)
              
                set({ messages: response.data.data})
                set({isMessagesLoading: false})
            })
            .catch((error) => {
                console.error(error);
                toast.error("Error fetching messages");
                set({ isMessagesLoading: false });
            })
    },

    // optimize this later
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
    
        // Validate selected user
        if (!selectedUser || !selectedUser._id) {
          toast.error("No user selected.");
          return;
        }
    
        // Ensure `messages` is always an array
        if (!Array.isArray(messages)) {
          set({ messages: [...messages] });
        }
    
        try {
          const response = await axiosInstance.post(
            `/message/send/${selectedUser._id}`,
            messageData
          );
          console.log('md', messageData);
          console.log('response', response.data);
          
          set({ messages: [...messages, response.data.data] }); 
        } catch (error) {
          console.error("Error sending message:", error);
          toast.error(error.response?.data?.message || "Failed to send message.");
        }
      },

      listenToMessages: () =>{
        const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
      },
      notToListenMessages: () =>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
      }

}))