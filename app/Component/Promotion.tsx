import Image from 'next/image'
import React from 'react'

const Promotion = () => {
  return (
    <div className="p-6 sm:p-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6  ">
      {/* Left Image */}
    <div className="h-[300px] sm:h-[550px] relative bg-white flex items-center justify-center">
  <Image
    src="/img12.jpg"
    alt="Promotion Image"
    fill
    className="object-contain "
  />
</div>


      {/* Right Text Section */}
      <div className="flex flex-col justify-center items-start py-6 sm:py-14">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-zentry special-font font-bold -tracking-tight text-start leading-tight">
          <b>30%</b> o<b>ff</b> <b>on</b> <b>a</b>ll n<b>e</b>w <b>a</b>rri<b>v</b>al
        </h1>

        {/* Caption */}
        <p className="mt-4 text-base sm:text-lg lg:text-xl text-gray-600 text-start font-circular-web">
          Upgrade your wardrobe today with timeless styles at unbeatable prices.
        </p>

        {/* Button */}
        <button className="bg-zinc-800 text-white py-2 px-6 rounded-md mt-6 text-sm sm:text-base hover:bg-gray-900 transition">
          Explore Now
        </button>
      </div>
    </div>
    
    </div>
  )
}

export default Promotion
