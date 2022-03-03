import React from "react";

function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      <div className="flex">
        <div className=" animate-spin animate-bounce  rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <div className=" animate-spin animate-bounce-1.25  rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <div className=" animate-spin animate-bounce-1.5  rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      </div>
      <h2 className="text-center text-white text-xl font-semibold">
        Loading...
      </h2>
      <p className="w-1/3 text-center text-white">
        This may take a few seconds, please don't close this page.
      </p>
    </div>
  );
}

export default Loading;
