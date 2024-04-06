import axios from 'axios';
const {apiKey}= require('../constants/ApiKey')

const client =  axios.create({
    headers:{
        Authorization:'Bearer ' + apiKey,
        "content-Type":'application/json'
    },
});

const chatGptEndPoint = 'https://api.openai.com/v1/chat/completions';
const dalleEndPoint = 'https://api.openai.com/v1/images/geenrations';

export const apiCall = async (prompt, messages)=>{
    try {
        const res= await client.post(chatGptEndPoint, {
            model:'gpt-3.5-turbo',
            messages:[
                {
                    role:'user',
                    content:`Does this message want to generate an AI picture, image, art or anything similar? ${prompt} . Simply answer with a yes or no.`,
                }
            ]
        })
        //console.log('data:', res.data.choices[0].message);
        let isArt = res.data?.choices[0]?.message?.content;
        if(isArt.toLowerCase().includes('yes')) {
            console.log('dalle api call');
            return dalleApiCall(prompt, messages || []);
        } else {
            console.log('chat gpt api call');
            return chatgptApicall(prompt, messages || []);
        }
    } catch (err) {
        console.log('error',err);
        return Promise.resolve({success:false,msg:err.message})
    }
}

const chatgptApicall = async ( prompt, messages)=> {
    try {
        const res= await client.post(chatGptEndPoint,{
            model:'gpt-3.5-turbo',
            messages,
        })
        let answer = res.data?.choices[0]?.message?.content;
        messages.push({role:'assistant',content:answer.trim()})
        return Promise.resolve({success:true,data:messages})
    }
    catch(err){
        console.log('error',err);
        return Promise.resolve({success:false, msg:err.message})
    }
}

const dalleApiCall = async (prompt,messages)=>{
    try{
        const res=await client.post(dalleEndPoint,{
            prompt,
            n:1,
        })
        let url= res?.data?.data[0]?.url;
        console.log('got url of the image',url);
        console.log(res.data);
        messages.push({role:'assistant',content:url})
        return Promise.resolve({success:true,data:messages})
    } catch(err){
        console.log('error',err);
        return Promise.resolve({success:false,msg:err.message})
    }
}