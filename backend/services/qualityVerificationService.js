const Anthropic=require('@anthropic-ai/sdk');
const fs=require('fs');
const path=require('path');
const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});

async function verifyCleanupQuality(beforePhotoPath,afterPhotoPath){
  try{
    const read=(p)=>{const abs=path.join(process.cwd(),p.replace(/^\//,''));return fs.readFileSync(abs).toString('base64');};
    const b64before=read(beforePhotoPath);
    const b64after=read(afterPhotoPath);
    const response=await client.messages.create({model:'claude-opus-4-5',max_tokens:500,messages:[{role:'user',content:[
      {type:'text',text:'You are a waste management AI inspector. Compare these two images.'},
      {type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64before}},
      {type:'text',text:'BEFORE (waste complaint). After cleaning:'},
      {type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64after}},
      {type:'text',text:'AFTER photo. Respond ONLY with JSON: {"improvement_percent":0-100,"status":"Successfully Cleaned"|"Partially Cleaned"|"Not Cleaned","cleanliness_score":0-100,"observations":"one sentence","verified":true|false}'},
    ]}]});
    const result=JSON.parse(response.content[0].text.replace(/```json|```/g,'').trim());
    return{success:true,...result};
  }catch(err){return{success:false,improvement_percent:0,status:'Verification Failed',cleanliness_score:0,verified:false,observations:err.message};}
}
module.exports={verifyCleanupQuality};
