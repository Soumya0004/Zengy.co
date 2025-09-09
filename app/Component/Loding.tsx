import React from 'react'

const Loding = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="three-body">
        <div className="three-body__dot" />
        <div className="three-body__dot" />
        <div className="three-body__dot" />
      </div>
    </div>
  )
}

export default Loding