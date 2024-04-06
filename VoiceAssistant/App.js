import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import Navigator from './src/navigation/Navigator'
import { apiCall } from './src/api/openAi'

export default function App() {
  useEffect(()=>{
    //apiCall('create an image or a dog playing with cat');
  },[])
  return (
    <Navigator/>
  )
}