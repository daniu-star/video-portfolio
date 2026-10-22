let ctx=null;
let master=null;
let nodes=[];
let muted=true;
let started=false;

try{muted=localStorage.getItem("atlas-audio-muted")!=="false"}catch{}

function makeNoise(){
  const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.24;
  const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;
  const filter=ctx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=680;filter.Q.value=.35;
  const gain=ctx.createGain();gain.gain.value=.022;
  source.connect(filter).connect(gain).connect(master);source.start();nodes.push(source);
}
function makeDrone(){
  [55,82.41].forEach((frequency,i)=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=i?"sine":"triangle";osc.frequency.value=frequency;gain.gain.value=i?.009:.012;
    osc.connect(gain).connect(master);osc.start();nodes.push(osc);
  });
}
export async function startAmbient(){
  if(!ctx){
    ctx=new AudioContext();
    master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    makeNoise();makeDrone();
  }
  if(ctx.state==="suspended")await ctx.resume();
  started=true;setMuted(muted);
}
export function setMuted(value){
  muted=Boolean(value);
  try{localStorage.setItem("atlas-audio-muted",String(muted))}catch{}
  if(master)master.gain.setTargetAtTime(muted?0:.055,ctx.currentTime,.35);
}
export function toggleMuted(){
  setMuted(!muted);return muted;
}
export function isMuted(){return muted}
export function stopAmbient(){
  if(!ctx)return;
  master.gain.setTargetAtTime(0,ctx.currentTime,.12);
}
export function audioState(){return {started,muted}}
