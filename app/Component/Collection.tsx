import Card from './Card';

const Collection = () => {
  const collectionItems = [
    { title: "hoody" },
    { title: "t-shirt" },
    { title: "jeans" },
    { title: "jacket" },
    { title: "sweatshirt" },
    { title: "shorts" }
  ];



  return (
    <div className="min-h-full px-4 sm:px-8 md:px-12 lg:px-20 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-0">
        <h1 className="font-zentry special-font text-4xl sm:text-5xl lg:text-6xl">
          <b>o</b>ur <b>c</b>oll<b>e</b>c<b>t</b>io<b>n</b>
        </h1>
        <p className="md:w-2/5 font-robert-medium text-sm sm:text-base lg:text-lg">
          Where timeless design meets modern luxury. Zengy.go creates clothing that defines elegance in every detail.
        </p>
      </div>

      {/* Category Buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        {collectionItems.map((item, index) => (
          <button 
            key={index} 
            className="border px-4 py-2 font-general uppercase text-sm rounded-lg hover:bg-zinc-800 hover:text-white transition"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Collection Grid */}
      <Card />

    </div>
  )
}

export default Collection
