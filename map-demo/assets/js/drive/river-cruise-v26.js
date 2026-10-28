/* Educational cruise simulation. No operational navigation, water levels, timetable or access assurance. */
(function(NS){'use strict';
const M=NS.Math3D;const R=()=>NS.HuajiangRiver;
const Boat={active:false,progress:.49,speed:0,throttle:.55,mode:'follow',paused:false,heading:0,elapsed:0,visualTimeScale:18,simDistance:0,
 launch(){if(NS.Drive?.active)NS.Drive.exit();if(NS.state.site!=='huajiang')NS.App.setSite('huajiang',false);
   document.body.classList.add('cinema-focus','is-boating');
   this.active=true;this.progress=R().boardingT;this.speed=2.4;this.throttle=.75;this.paused=false;this.mode='follow';this.elapsed=0;this.simDistance=0;
   const board=document.getElementById('v27BoatBoard');if(board)board.hidden=true;this.applyCamera();this.show();},
 show(){document.getElementById('v26BoatPanel').hidden=false;this.refresh();},
 refresh(){const panel=document.getElementById('v26BoatPanel');if(!panel)return;
   document.getElementById('v26BoatSpeed').textContent=(this.speed*3.6).toFixed(1)+' km/h（模拟）';
   document.getElementById('v26BoatProgress').textContent=Math.round(this.progress*100)+'% · 加速演示 ×'+this.visualTimeScale;
   document.getElementById('v26BoatThrottle').value=Math.round(this.throttle*100);
   document.getElementById('v26BoatPause').textContent=this.paused?'▶ 继续':'Ⅱ 暂停';
   panel.querySelectorAll('[data-boat-view]').forEach(b=>b.classList.toggle('selected',b.dataset.boatView===this.mode));},
 advance(dt){if(!this.active)return;
   // Low-speed scalar propulsion: dv/dt = thrust - linear and quadratic drag.
   // Physically motivated but uncalibrated, no bathymetry or real engine data.
   if(!this.paused){const target=2.0+this.throttle*6.0;
    const acceleration=(.95*this.throttle- .065*this.speed-.014*this.speed*this.speed);
    this.speed=M.clamp(this.speed+acceleration*dt,0,Math.min(7.5,target));
    const travel=this.speed*dt*this.visualTimeScale;this.simDistance+=travel;this.progress=M.clamp(this.progress+travel/(R().end-R().start),0,1);this.elapsed+=dt;
    if(this.progress>=.985){this.paused=true;this.speed=0;document.getElementById('v26BoatTip').textContent='已到达教学游线终点，可以重新体验或返回地图。'}
   }else this.speed*=Math.max(0,1-1.4*dt);
   this.applyCamera();if(Math.round(this.elapsed*5)!==this._lastUiTick){this._lastUiTick=Math.round(this.elapsed*5);this.refresh();}},
 applyCamera(){if(!this.active)return;const p=R().at(this.progress),f=R().at(Math.min(1,this.progress+.008));
   const dir=M.norm({x:f.x-p.x,y:f.y-p.y,z:f.z-p.z}),side={x:dir.z,y:0,z:-dir.x};
   const look={x:p.x+dir.x*(this.mode==='first'?80:20),y:p.y+(this.mode==='first'?18:10),z:p.z+dir.z*(this.mode==='first'?80:20)};let eye;
   if(this.mode==='first'){eye={x:p.x+dir.x*9,y:p.y+12,z:p.z+dir.z*9};}
   else if(this.mode==='aerial'){eye={x:p.x-dir.x*85+side.x*85,y:p.y+115,z:p.z-dir.z*85+side.z*85};}
   else eye={x:p.x-dir.x*86+side.x*36,y:p.y+49,z:p.z-dir.z*86+side.z*36};
   NS.App.engine.targetCam=null;NS.App.engine.cam.pose={eye,look};},
 setThrottle(n){this.throttle=M.clamp(+n/100,0,1);this.refresh()},
 setView(mode){if(!['first','follow','aerial'].includes(mode))return;this.mode=mode;this.applyCamera();this.refresh()},
 toggle(){this.paused=!this.paused;this.refresh()},
 reset(){this.progress=R().boardingT;this.speed=2.4;this.paused=false;this.elapsed=0;this.simDistance=0;document.getElementById('v26BoatTip').textContent='教学模拟：场景河道与游船控制不代表真实航线与运营条件。';this.refresh()},
 exit(){if(!this.active)return;this.active=false;this.paused=true;document.body.classList.remove('is-boating');document.getElementById('v26BoatPanel').hidden=true;
   NS.App.engine.cam.pose=null;NS.App.engine.fly(NS.App.cinemaCamera('huajiang'),.9);}
};NS.Boat=Boat;
function init(){document.getElementById('v26BoatStart')?.addEventListener('click',()=>Boat.launch());document.getElementById('v27BoatBoard')?.addEventListener('click',()=>Boat.launch());document.getElementById('v26BoatClose')?.addEventListener('click',()=>Boat.exit());
 document.getElementById('v26BoatPause')?.addEventListener('click',()=>Boat.toggle());
 document.getElementById('v26BoatReset')?.addEventListener('click',()=>Boat.reset());
 document.getElementById('v26BoatThrottle')?.addEventListener('input',e=>Boat.setThrottle(e.target.value));
 document.querySelectorAll('[data-boat-view]').forEach(el=>el.addEventListener('click',()=>Boat.setView(el.dataset.boatView)));
 document.addEventListener('keydown',e=>{if(Boat.active&&e.key==='Escape'){Boat.exit();e.preventDefault()}},true);
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window.SpatialApp=window.SpatialApp||{});
