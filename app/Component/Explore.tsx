import Image from "next/image";
import React from "react";

const Explore = () => {
  return (
    <div className="px-6 md:px-12 py-16">
      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="relative rounded-xl overflow-hidden shadow-md group h-[300px] md:h-[565px] w-full">
          <Image
            src="/img10.jpg"
            alt="Image 1"
            fill
    className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md font-medium shadow hover:bg-gray-100">
            Explore Now
          </button>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-xl overflow-hidden shadow-md group h-[300px] md:h-[565px] w-full">
  <Image
    src="/img11.jpg"
    alt="Image 2"
    fill
    className="object-cover transition-transform duration-300 group-hover:scale-105"
  />

  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md font-medium shadow hover:bg-gray-100">
    Explore Now
  </button>
</div>


        {/* Right Side (2 stacked cards) */}
        <div className="flex flex-col gap-6">
          
          {/* Top small card */}
          <div className="relative rounded-xl overflow-hidden shadow-md group">
            <Image
              src="/img8.jpg"
              alt="Image 3"
              width={500}
              height={240}
              className="object-cover w-full h-[250px] md:h-[270px] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 text-black">
              <p className="text-md uppercase special-font font-zentry -tracking-tight ">
                Wi<b>nt</b>er Coll<b>e</b>cti<b>on</b>
              </p>
              <h3 className="font-semibold text-lg">
                Stylish Winter T-Shirt for Men
              </h3>
              <button className="mt-2 border border-black px-3 py-1 text-sm rounded-md hover:bg-black hover:text-white">
                Check Now
              </button>
            </div>
          </div>

          {/* Bottom small card */}
          <div className="relative rounded-xl overflow-hidden shadow-md group">
            <Image
              src="/img4.jpg"
              alt="Image 4"
              width={500}
              height={240}
              className="object-cover w-full h-[230px] md:h-[270px] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-4 right-6 text-[#8cd585] left-4">
              <p className="text-md uppercase special-font font-zentry -tracking-tight">
                <b>M</b>en Co<b>ll</b>ec<b>t</b>ion
              </p>
              <h3 className="font-semibold text-lg">
                Stylish Winter Shirt for Man
              </h3>
              <button className="mt-2 border border-black px-3 py-1 text-sm rounded-md hover:bg-black hover:text-white text-black">
                Check Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Explore;
