import React from 'react';

function Home() {
    return (
        <div className="bg-cover bg-center bg-gray-600 h-screen">
            <div className=" text-9xl text-center  text-white">
                Draw Real Time
            </div>
            <div className="gird justify-center h-5/6">
                <div className=''>
                    <label htmlFor='room_id' >Room Id</label>
                </div>
                <div>
                    <input type = "text" name = "room_id"/>
                </div>
                <button type = "submit">Join</button>
            </div>
        </div>
    );
}


export default Home;  