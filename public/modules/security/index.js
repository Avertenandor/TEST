export default { async mount(root){ const r=await fetch('/public/modules/security/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };

