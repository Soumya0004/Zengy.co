
"use client"
import ScrollVelocity from '@/components/ScrollVelocity'
import React from 'react'

const ScrollVelocityUse = () => {
  return (
    <div><ScrollVelocity
  texts={['have your great style ', 'show your unique personality ']} 
  velocity={100} 
  className="custom-scroll-text"
/>
</div>
  )
}

export default ScrollVelocityUse