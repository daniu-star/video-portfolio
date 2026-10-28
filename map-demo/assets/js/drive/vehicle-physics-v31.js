/* V31 — self-contained, reduced-order teaching vehicle model (not homologated dynamics).
   SI inputs: m, s, kg, N. Authored route units are treated as approximate metres.
   Fixed substeps avoid framerate-dependent acceleration, suspension and input response. */
(function(NS){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
class VehiclePhysicsV31{
 constructor(){this.reset()}
 reset(){this.speed=12;this.distance=0;this.accel=0;this.throttle=0;this.brake=0;this.steer=0;
  this.lateral=0;this.lateralSpeed=0;this.heave=0;this.heaveSpeed=0;this.roll=0;this.pitch=0;
  this.elapsed=0;this.curvature=0;this.grade=0;this.lateralG=0;this.grip=.82;this.boundary=false;this.fatigue=0}
 step(dt,cmd,route,progress,weather='dry'){
  const h=clamp(dt,0,.05);if(!h)return;
  const frame=route.at(progress),ahead=route.at(clamp(progress+.004,0,1)),behind=route.at(clamp(progress-.004,0,1));
  const cross=behind.forward.x*ahead.forward.z-behind.forward.z*ahead.forward.x;
  const span=Math.max(.001,route.length*.008);
  this.curvature=cross/span;this.grade=clamp(frame.forward.y,-.16,.16);
  const mu=weather==='wet'?.52:.82;this.grip=mu;
  const throttle=clamp(cmd.throttle||0,0,1),brake=clamp(cmd.brake||0,0,1);
  const wantedSteer=clamp(cmd.steer||0,-1,1);this.steer+=(wantedSteer-this.steer)*(1-Math.exp(-h*5));
  this.throttle=throttle;this.brake=brake;
  // A simple driving-force/drag/rolling model, capped by tire-road grip.
  const mass=1580,g=9.81,force=5400*throttle-9200*brake;
  const aero=.5*1.225*.72*this.speed*this.speed,rolling=.014*mass*g*Math.cos(Math.asin(this.grade));
  const slopeForce=mass*g*this.grade;
  this.accel=clamp((force-aero-rolling-slopeForce)/mass,-mu*g,mu*g);
  const oldSpeed=this.speed;
  this.speed=clamp(this.speed+this.accel*h,0,27.78);
  // Steering is lane-keeping input, not full unconstrained vehicle movement.
  const lateralTarget=this.steer*Math.min(2.3,this.speed*.10);
  this.lateralSpeed+=(lateralTarget-this.lateralSpeed)*(1-Math.exp(-h*4.5));
  this.lateral+=this.lateralSpeed*h;
  this.boundary=Math.abs(this.lateral)>10.5;
  if(this.boundary){this.lateral=clamp(this.lateral,-10.5,10.5);this.lateralSpeed*=.12;this.speed=Math.min(this.speed,14)}
  this.lateralG=clamp((this.speed*this.speed*Math.abs(this.curvature)+Math.abs(this.lateralSpeed)*.7)/g,0,2);
  // Visual suspension with a repeatable road-joint input, not random jitter.
  this.elapsed+=h;
  const bump=(Math.sin(this.distance*.23)*.038+Math.sin(this.distance*.91)*.012)*Math.min(1,this.speed/10);
  const desiredHeave=-this.accel*.006+bump;
  const spring=24,damper=9;
  this.heaveSpeed+=(spring*(desiredHeave-this.heave)-damper*this.heaveSpeed)*h;
  this.heave+=this.heaveSpeed*h;
  const targetPitch=clamp(-this.accel*.006-this.grade*.10,-.06,.06);
  const signedCurve=(this.curvature<0?-1:1)*Math.min(.055,this.lateralG*.055);
  const targetRoll=clamp(-signedCurve-this.steer*.022,-.07,.07);
  const w=1-Math.exp(-h*3);
  this.pitch+=(targetPitch-this.pitch)*w;this.roll+=(targetRoll-this.roll)*w;
  const travelled=(oldSpeed+this.speed)*.5*h;
  this.distance+=travelled;
  return travelled;
 }
 diagnostics(){return{speedKmh:this.speed*3.6,acceleration:this.accel,gradePct:this.grade*100,lateralG:this.lateralG,offset:this.lateral,roll:this.roll,pitch:this.pitch,grip:this.grip,edge:this.boundary}}
}
NS.VehiclePhysicsV31=VehiclePhysicsV31;
})(window.SpatialApp=window.SpatialApp||{});
