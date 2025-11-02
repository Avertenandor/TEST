export default { async mount(root){ const r=await fetch('/modules/final-cta/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };

