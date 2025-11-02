export default { async mount(root){ const r=await fetch('/modules/referral/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };
