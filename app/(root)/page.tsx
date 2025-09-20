
import React from 'react'
import Hero from '../Component/Hero'
import Explore from '../Component/Explore'
import Collection from '../shop/Collection'
import Promotion from '../Component/Promotion'
import ScrollVelocityUse from '../Component/ScrolevelocityUse'

const page = () => {
  return (
    <div >
      <Hero/>
      <ScrollVelocityUse/>
      <Explore/>
      <Collection/>
      <Promotion/>
    </div>
  )
}

export default page