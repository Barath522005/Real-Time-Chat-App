import {createSlice} from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:null,
    },
    reducers:{
        setMessages:(state,action)=>{
            state.messages = action.payload;
        },
        deleteMessage:(state,action)=>{
            if(state.messages){
                state.messages = state.messages.filter(msg => msg._id !== action.payload);
            }
        }
    }
});
export const {setMessages, deleteMessage} = messageSlice.actions;
export default messageSlice.reducer;