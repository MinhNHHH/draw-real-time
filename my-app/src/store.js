import { configureStore } from '@reduxjs/toolkit'
import  penSlice  from './slice/penSlice'


export default configureStore({
    reducer : {
        pen: penSlice
    }
})