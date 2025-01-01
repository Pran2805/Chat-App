import { create } from "zustand"
import { axiosInstance } from "../utils/axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client";
import {BASE_URL} from '../constants'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    isCheckingAuth: true,
    socket: null,

    // checking use is logged or not
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/user/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/user/register", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");

            get().connectSocket();

        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/user/logout')
            set({ authUser: null });
            toast.success("Logged Out Successfully")

            get().disconnectSocket()
        } catch (error) {
            console.log("Error in logout:", error);
            toast.error("Something Went Wrong")
        }
    },


    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/user/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();

        } catch (error) {
            console.log(error);

            toast.error(error.response.statusText);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put('/user/update', data)
            set({ authUser: res.data })
            // console.log('here');

            toast.success('Profile Updated Successfully')
        } catch (error) {
            toast.success(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })
        }


    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },

}))