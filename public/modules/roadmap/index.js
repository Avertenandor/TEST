export default { async mount(root){ const r=await fetch('/modules/roadmap/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };

