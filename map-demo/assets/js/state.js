(function(NS){'use strict';
const listeners=[];
const state={entered:false,driveStatus:null,site:'huajiang',mode:'infrastructure',theme:'nebula',selected:null,selectedFeature:null,hoveredFeature:null,hovered:null,inspectorTab:'overview',showQuiet:true,timeline:.99,timelinePulse:0,selectionEpoch:0,story:false,storyIndex:0,measure:null,showLabels:true,camera:{yaw:-.58,pitch:.78,distance:6500,target:{x:0,y:80,z:0}}};
NS.state=state;NS.onState=fn=>listeners.push(fn);NS.setState=(patch)=>{Object.assign(state,patch);listeners.forEach(fn=>fn(state,patch))};
})(window.SpatialApp=window.SpatialApp||{});
