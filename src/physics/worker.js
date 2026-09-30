function scientificWorkerSource() {
  const funcs=[isFiniteAstronomyNumber,dotVec3,subtractVec3,crossVec3,createBody,createSimulationState,
    cloneSimulationState,nBodyAccelerations,gravitationalPotentialEnergy,velocityVerletStep,
    simulationDiagnostics,simulationQuality,interpolateEphemeris,ephemerisState,stumpff,solveLambert,missionFromEphemeris];
  return `const PHYSICS_UNITS=${JSON.stringify(PHYSICS_UNITS)}; const J2000_JD=${J2000_JD},AU_KM=${AU_KM},GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2=${GRAVITATIONAL_CONSTANT_AU3_SOLAR_MASS_DAY2};\n`+
    funcs.map(f=>f.toString()).join("\n")+`
    onmessage=e=>{try{
      const {task,payload}=e.data;
      if(task==='simulation'){
        let s=createSimulationState(payload.state.bodies,payload.state);
        s.steps=payload.state.steps;s.category=payload.state.category;s.sourceProvenance=payload.state.sourceProvenance;
        const initial=simulationDiagnostics(s),start=s.timeJd,duration=payload.durationDays;
        if(!Number.isFinite(duration)||duration<=0||Math.ceil(duration/s.stepDays)>100000)throw new Error('Invalid/budget-exceeding simulation');
        const steps=Math.ceil(duration/s.stepDays);
        for(let i=0;i<steps;i++){s=velocityVerletStep(s,Math.min(s.stepDays,duration-i*s.stepDays));
          if(i%1000===0)postMessage({progress:i/steps});}
        postMessage({done:true,result:{state:s,quality:simulationQuality(s,initial,start)}});
      }else if(task==='mission-grid'){
        const {asset,departure,arrival,departures,durations}=payload;
        if(!Array.isArray(departures)||!Array.isArray(durations)||departures.length<1||durations.length<1||departures.length*durations.length>4096 ||
           !departures.every(Number.isFinite)||!durations.every(x=>Number.isFinite(x)&&x>0))throw new Error('Invalid/budget-exceeding mission grid');
        const grid=new Float64Array(departures.length*durations.length*4),failures=[];let i=0;
        for(const jd of departures)for(const duration of durations){grid[i*4]=jd;grid[i*4+1]=duration;
          try{const m=missionFromEphemeris(asset,departure,arrival,jd,jd+duration,payload.options);
            grid[i*4+2]=m.c3Km2S2;grid[i*4+3]=m.arrivalVInfinityKmS;
          }catch(error){grid[i*4+2]=NaN;grid[i*4+3]=NaN;failures.push({index:i,reason:error.message});}
          i++;if(i%32===0)postMessage({progress:i/(departures.length*durations.length)});}
        postMessage({done:true,result:{grid,failures,departures,durations,category:'patched-conic launch-window exploration',
          timeScale:'TDB',frame:'heliocentric ICRF',source:asset.source,validRangeJd:asset.validRangeJd}},[grid.buffer]);
      }else throw new Error('Unknown scientific job');
    }catch(error){postMessage({error:error.message})}};`;
}
function runScientificJob(task,payload,options={}) {
  if (!window.Worker) return Promise.reject(new Error("This workload requires a Web Worker."));
  if (options.signal?.aborted) return Promise.reject(abortImportError());
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(new Blob([scientificWorkerSource()],{type:"text/javascript"}));let worker;
    try {worker=new Worker(url);} catch(error){URL.revokeObjectURL(url);reject(error);return;}
    const cleanup=()=>{worker.terminate();URL.revokeObjectURL(url);options.signal?.removeEventListener("abort",abort);};
    const abort=()=>{cleanup();reject(new DOMException("Scientific job cancelled.","AbortError"));};
    options.signal?.addEventListener("abort",abort,{once:true});
    worker.onmessage=e=>{if(e.data.error){cleanup();reject(new Error(e.data.error));}
      else if(e.data.done){cleanup();resolve(e.data.result);}else options.onProgress?.(e.data.progress);};
    worker.onerror=e=>{cleanup();reject(new Error(e.message));};worker.postMessage({task,payload});
  });
}
