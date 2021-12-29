import { createSlice } from "@reduxjs/toolkit"

export const penSlice = createSlice({
    name: "pen_draw",
    initialState: {
        pen: "line",
        color : "black"
    },
    reducers: {
        setPen: (state, actions) => {
            state.pen = actions.payload
        },
        setColor: (state, actions) => {
            state.color = actions.payload
        }
    }
})

export const { setPen,setColor } = penSlice.actions
export default penSlice.reducer
