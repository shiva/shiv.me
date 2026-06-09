const btn=document.getElementById('toggle');
const states=['auto','dark','light']; let mode='auto';
function isDark(){
  if(mode==='dark') return true;
  if(mode==='light') return false;
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}
function render(){
  document.body.classList.remove('dark','light');
  if(mode!=='auto') document.body.classList.add(mode);
  btn.textContent=isDark()?'☾':'☀';
  btn.title=mode==='auto'?'Theme: auto ('+(isDark()?'dark':'light')+')':'Theme: '+mode;
}
try{ const s=localStorage.getItem('theme'); if(s&&states.includes(s)) mode=s; }catch(e){}
render();
btn.addEventListener('click',()=>{
  mode=states[(states.indexOf(mode)+1)%states.length];
  try{localStorage.setItem('theme',mode);}catch(e){}
  render();
});
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',render);
