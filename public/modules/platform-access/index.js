export default { async mount(root){ const r=await fetch('/modules/platform-access/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };

