import React, { useState } from 'react';

function Home() {
    const [idRoom, setIdRoom] = useState(null)

    const onChangeIdRoom = (e) => {
        setIdRoom(e.target.value)
    }
    const joinFunction = () => {
        if (idRoom === null) {
            return
        }
        window.location.replace(`/${idRoom}`)
    }

    return (
        <div className="bg-cover bg-center bg-gray-600 h-screen">
            <div className='absolute place-items-center h-3/4 w-96 bg-gray-700 left-4/10 top-28 rounded-3xl'>
                <p className='text-center text-3xl top-5 m-7  text-white '>
                    Draw Real Time
                </p>
                <div className='mt-24 text-3xl p-4 text-white'>
                    <label htmlFor='roomId'>Room ID</label>
                </div>
                <div className='p-4'>
                    <input type="text" name="roomId" className=' w-full h-12 rounded-full border-solid p-4' placeholder='Please enter room id' onChange={onChangeIdRoom} />
                    <button type='submit' className='text-center w-full mt-5 h-12 rounded-full bg-indigo-600 text-white text-2xl' onClick={joinFunction}>Join</button>
                </div>
            </div>
        </div>
    );
}


export default Home;  