import { View, Text, Alert, StatusBar, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Features from '../components/Features';
import { dummyMessages } from '../constants';
import Voice from '@react-native-community/voice';
import { apiCall } from '../api/openAi';
import Tts from 'react-native-tts';

export default function HomeScreen() {
    const [messages,setMessages]=useState([])
    const [recording, setRecording]=useState(false);
    const [speaking,setSpeaking]=useState(false)
    const [result,setResult]=useState('')
    const [loading,setLoading]=useState(false)
    const ScrollViewRef=useRef();

    const speechStartHandler=()=>{
        console.log('speech start handler')
    }

    const speechEndHandler=()=>{
        setRecording(false)
        console.log('speech end handler')
    }

    const speechResultHandler=(e)=>{
        console.log('voice event',e)
        const text=e.value[0];
        setResult(text)
    }

    const speechErrorHandler=(e)=>{
        console.log('speech error handler',e)
    }

    const startRecording=async()=>{
        setRecording(true);
        Tts.stop();
        try{
            await Voice.start('en-GB');
        } catch(error) {
            console.log('error',error)
        }
    }

    const stopRecording=async()=>{
        try{
            await Voice.stop();
            setRecording(false)
            //fetch response
            fetchResponse();
        } catch(error) {
            console.log('error',error)
        }
    }

    const fetchResponse = ()=>{
        if(result.trim().length>0){
            let newMessages=[...messages];
            newMessages.push({role:'user',content:result.trim()})
            setMessages([...newMessages]);
            updateScrollView();
            setLoading(true);
            apiCall(result.trim(),newMessages).then(res=>{
                //console.log('got api data',res);
                setLoading(false);
                if(res.success) {
                    setMessages([...res.data])
                    updateScrollView();
                    setResult('');
                    startTextToSpeech(res.data[res.data.length-1])
                } else {
                    Alert.alert('Error',res.msg)
                }
            })
        }
    }

    const startTextToSpeech=message=>{
        if(!message.content.includes('https')){
            setSpeaking(true);
            Tts.speak(message.content,{
                androidParams:{
                    KEY_PARAM_PAN:-1,
                    KEY_PARAM_VOLUME:0.5,
                    KEY_PARAM_STREAM:'STREAM_MUSIC',
                }
            })
        }
    }

    const updateScrollView=()=>{
        setTimeout(()=>{
            ScrollViewRef?.current?.scrollToEnd({animated:true})
        },200)
    }

    const clear = () => {
        setMessages([])
        Tts.stop();
    }

    const stopSpeaking = () => {
        Tts.stop();
        setSpeaking(false)
    }

    useEffect(()=>{
        Voice.onSpeechStart=speechStartHandler;
        Voice.onSpeechEnd=speechEndHandler;
        Voice.onSpeechResults=speechResultHandler;
        Voice.onSpeechError=speechErrorHandler;

        //tts handlers
        Tts.addEventListener('tts-start',event=>console.log('start',event));
        Tts.addEventListener('tts-progress',event=>console.log('progress',event));
        Tts.addEventListener('tts-finish',event=>{
            console.log('finish',event);
            setSpeaking(false)
        })
        Tts.addEventListener('tts-cancel',event=>{
            console.log('cancel',event)
        })
        return()=>{
            Voice.destroy().then(Voice.removeAllListeners)
        }
    },[])

    //console.log('result',result)
  return (
    <View className='flex-1 bg-white'>
        <StatusBar barStyle='dark-content'
        backgroundColor='transparent'
        translucent={true} />
        <SafeAreaView className='flex-1 flex mx-5'>
            <View className='flex-row justify-center'>
                <Image source={require('../../assets/images/bot.png')} style={{width:wp(35), height:wp(35), marginTop:70}} />
            </View>

           {/* features || messages */}
           {messages.length > 0 ? (
            <View className="space-y-2 flex-1">
                <Text style={{fontSize:wp(5)}}
                className="text-gray-700 font-semibold ml-1">Assistant</Text>
                <View style={{height:hp(58)}} className="bg-neutral-200 rounded-3xl p-4">
                    <ScrollView ref={ScrollViewRef} bounces={false} className='space-y-4' showsVerticalScrollIndicator={false}>
                        {messages.map((message,index)=>{
                            if(message.role=='assistant') {
                                if(message.content.includes('https')) {
                                    //its an ai image
                                    return (
                                        <View key={index} className="flex-row justify-start">
                                            <View className="p-2 flex rounded-2xl bg-emerald-100 rounded-tl-none">
                                                <Image source={{uri:message.content}}
                                                className="rounded-2xl"
                                                style={{height:wp(60),width:wp(60)}}
                                                resizeMode='contain'
                                                />
                                            </View>
                                        </View>
                                    )
                                } else {
                                    //text response
                                    return (
                                        <View key={index}
                                        style={{width:wp(70)}}
                                        className="bg-emerald-100 rounded-xl p-2 rounded-tr-none">
                                            <Text style={{color:'black'}}>{message.content}</Text>
                                        </View>
                                    )
                                }
                            } else {
                                //user input
                                return (
                                    <View key={index} className="flex-row justify-end">
                                        <View style={{width:wp(70)}}
                                        className="bg-white rounded-xl p-2 rounded-tr-none">
                                            <Text style={{color:'black'}}>{message.content}</Text>
                                        </View>
                                    </View>
                                )
                            }

                        })}
                    </ScrollView>
                </View>
            </View>
           ):(
            <Features />
           )}

           {/* recording, clear and stop buttons */}
           <View className="flex justify-center items-center">
            {loading ? (
                <Image source={require('../../assets/images/loading.gif')} style={{height:hp(15),width:hp(15)}} />
            ):recording ? (
                <TouchableOpacity onPress={stopRecording}>
                    {/* recording stop button */}
                    <Image className="rounded-full"
                    source={require('../../assets/images/record.gif')} style={{width:hp(15), height:hp(15)}} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={startRecording}>
                    {/* recording start button */}
                    <Image className='rounded-full'
                    source={require('../../assets/images/recording.png')} style={{width:hp(10),height:hp(10),marginTop:20,marginBottom:20}} />
                </TouchableOpacity>
            )}

            {messages.length > 0 && (
                <TouchableOpacity onPress={clear} className="bg-neutral-400 rounded-3xl p-2 absolute right-10">
                    <Text className="text-white font-semibold">Clear</Text>
                </TouchableOpacity>
            )}
            {speaking && (
                <TouchableOpacity onPress={stopSpeaking} className="bg-red-400 rounded-3xl p-2 absolute left-10">
                    <Text className="text-white font-semibold">Stop</Text>
                </TouchableOpacity>
            )}
           </View>
        </SafeAreaView>
      
    </View>
  )
}