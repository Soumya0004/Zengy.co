import React from 'react'
import Nav from '../Component/Nav'
import Hero from '../Component/Hero'
import Explore from '../Component/Explore'
import Collection from '../Component/Collection'
import Promotion from '../Component/Promotion'
import Footer from '../Component/Footer'

const page = () => {
  return (
    <div >
      <Nav/>
      <Hero/>
      <Explore/>
      <Collection/>
      <Promotion/>
      <Footer/>
    </div>
  )
}

export default page