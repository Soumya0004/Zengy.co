import React from 'react'
import Nav from './Component/Nav'
import Hero from './Component/Hero'
import Explore from './Component/Explore'
import Collection from './Component/Collection'
import Promotion from './Component/Promotion'

const page = () => {
  return (
    <div >
      <Nav/>
      <Hero/>
      <Explore/>
      <Collection/>
      <Promotion/>
    </div>
  )
}

export default page