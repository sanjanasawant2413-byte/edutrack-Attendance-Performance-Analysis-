const SUBJECTS=['Mathematics','Science','English'];
const SUBKEYS=['math','science','english'];
const CLASSES=['8-A','8-B','9-A','9-B','10-A'];
const FIRST=['Aarav','Ananya','Rohan','Isha','Vivaan','Siya','Aditya','Aditi','Kabir','Myra','Arjun','Sara','Atharv','Avni','Dhruv','Diya','Reyansh','Kiara','Vedant','Anika','Yash','Riya','Om','Tanvi','Siddharth','Pooja','Kunal','Sneha','Rudra','Aanya','Pranav','Ishita','Harsh','Mahi','Ayush','Nandini','Samar','Navya','Raj','Kavya','Manav','Shruti','Neil','Meera','Ritvik','Jhanvi','Akshay','Sakshi','Varun','Neha'];
const LAST=['Sharma','Patil','Gupta','Deshmukh','Joshi','Kulkarni','More','Shah','Mehta','Nair','Singh','Khan','Jadhav','Pawar','Chavan','Sawant','Gaikwad','Bhosale','Mishra','Verma'];
function localDateKey(date=new Date()){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
const TODAY_KEY=localDateKey();
const TODAY_LABEL=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
function makeStudent(i){
  const base=66+(i*17)%31, att=Math.max(58,Math.min(98,base));
  const monthly={}; const daily={};
  SUBKEYS.forEach((k,j)=>{
    const m=Math.max(55,Math.min(99,att + ((i+j*7)%9)-4));
    monthly[k]=m;
    daily[k]=(((i+j*3)%13)<Math.round(m/10))?'Present':'Absent';
  });
  return {id:i+1,name:`${FIRST[i%FIRST.length]} ${LAST[(i*7)%LAST.length]}${i>=50?' '+(Math.floor(i/50)+1):''}`,className:CLASSES[i%CLASSES.length],
    attendance:att,math:Math.max(45,Math.min(99,att-10+(i*5)%18)),science:Math.max(45,Math.min(99,att-7+(i*7)%20)),english:Math.max(45,Math.min(99,att-4+(i*3)%18)),monthly,daily};
}
const seed=Array.from({length:150},(_,i)=>makeStudent(i));
let stored=JSON.parse(localStorage.getItem('eduStudents')||'null');
let students=stored||seed;
if(students.length<150){const existingIds=new Set(students.map(s=>s.id));seed.forEach(s=>{if(students.length<150&&!existingIds.has(s.id)){students.push(s);existingIds.add(s.id)}})}
students=students.map(s=>{s.monthly=s.monthly||{math:s.attendance,science:s.attendance,english:s.attendance};s.daily=s.daily||{math:'Present',science:'Present',english:'Present'};return s});
let attendanceRecords=JSON.parse(localStorage.getItem('eduAttendanceRecords')||'{}');
let charts={},editingId=null;
const $=x=>document.getElementById(x);
const avg=s=>Math.round((+s.math+(+s.science)+(+s.english))/3);
const monthlyAvg=s=>Math.round(SUBKEYS.reduce((a,k)=>a+(+s.monthly[k]||0),0)/3);
const dailyPresent=s=>SUBKEYS.filter(k=>s.daily[k]==='Present').length;
const save=()=>localStorage.setItem('eduStudents',JSON.stringify(students));
function status(s){let a=monthlyAvg(s),v=(+s.attendance+a)/2;return v>=85?['Excellent','good']:v>=70?['Monitor','warn']:['At Risk','bad']}
function table(head,rows){return '<div class="tablewrap"><table><thead><tr>'+head.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>'}
function filtered(){let c=$('classFilter').value,q=$('search').value.toLowerCase(),r=$('riskFilter').value;return students.filter(s=>(c==='All'||s.className===c)&&s.name.toLowerCase().includes(q)&&(r==='all'||(r==='risk'?(s.attendance<75||avg(s)<55):(s.attendance>=90&&avg(s)>=80))))}
function classes(){let sel=$('classFilter'),v=sel.value;[...new Set(students.map(s=>s.className))].sort().forEach(c=>{if(![...sel.options].some(o=>o.value===c))sel.add(new Option(c,c))});sel.value=v||'All'}
function destroy(k){if(charts[k])charts[k].destroy()}
function todaysOnlinePresenceByClass(){return CLASSES.map(className=>{const classStudents=students.filter(s=>s.className===className);const total=classStudents.length;let present=0;classStudents.forEach(student=>{const statusList=SUBKEYS.map(subject=>{const key=`${TODAY_KEY}|${subject}`;const record=attendanceRecords[key]||{};return(record[student.id]||student.daily[subject]||'Present')==='Present';});if(statusList.some(Boolean))present++;});return{className,total,present,absent:total-present,rate:total?Math.round((present/total)*100):0};});}
function renderTodayPresence(){const summary=todaysOnlinePresenceByClass();$('todayClassSummary').innerHTML=summary.map(item=>`<div class="day-presence-item"><div class="day-presence-top"><span class="class-badge">${item.className}</span><strong>${item.present}/${item.total}</strong></div><div class="presence-track"><span style="width:${item.rate}%"></span></div><div class="day-presence-meta"><small>${item.rate}% present</small><small>${item.absent} absent</small></div></div>`).join('');}
function dashboard(){
 let d=filtered(),aa=d.length?Math.round(d.reduce((a,s)=>a+s.attendance,0)/d.length):0,ap=d.length?Math.round(d.reduce((a,s)=>a+avg(s),0)/d.length):0;
 $('total').textContent=d.length;$('attendanceAvg').textContent=aa+'%';$('performanceAvg').textContent=ap+'%';$('risk').textContent=d.filter(s=>s.attendance<75||avg(s)<55).length;
 $('riskTable').innerHTML=table(['Student','Class','Attendance','Monthly Avg','Performance','Status'],d.filter(s=>s.attendance<80||avg(s)<65).map(s=>{let x=status(s);return `<tr><td><b>${s.name}</b></td><td>${s.className}</td><td>${s.attendance}%</td><td>${monthlyAvg(s)}%</td><td>${avg(s)}%</td><td><span class="status ${x[1]}">${x[0]}</span></td></tr>`}));
 $('topTable').innerHTML=table(['Rank','Student','Class','Attendance','Performance'],[...d].sort((a,b)=>avg(b)-avg(a)).slice(0,5).map((s,i)=>`<tr><td>#${i+1}</td><td><b>${s.name}</b></td><td>${s.className}</td><td>${s.attendance}%</td><td>${avg(s)}%</td></tr>`));
 renderTodayPresence();
 destroy('scatter');charts.scatter=new Chart($('scatter'),{type:'scatter',data:{datasets:[{label:'Students',data:d.map(s=>({x:s.attendance,y:avg(s)})),pointRadius:5}]},options:{responsive:true,scales:{x:{title:{display:true,text:'Overall Attendance %'},min:40,max:100},y:{title:{display:true,text:'Performance %'},min:30,max:100}}}});
 let cs=[...new Set(students.map(s=>s.className))].sort();destroy('class');charts.class=new Chart($('classChart'),{type:'bar',data:{labels:cs,datasets:[{label:'Attendance %',data:cs.map(c=>{let z=students.filter(s=>s.className===c);return Math.round(z.reduce((a,s)=>a+s.attendance,0)/z.length)})}]},options:{responsive:true,scales:{y:{beginAtZero:true,max:100}}}});
}
function studentsPage(){let q=$('studentSearch').value.toLowerCase(),d=students.filter(s=>s.name.toLowerCase().includes(q));$('studentTable').innerHTML=table(['Name','Class','Overall','Math Monthly','Science Monthly','English Monthly','Math Daily','Science Daily','English Daily','Performance','Status','Actions'],d.map(s=>{let x=status(s);return `<tr><td><b>${s.name}</b></td><td>${s.className}</td><td>${s.attendance}%</td><td>${s.monthly.math}%</td><td>${s.monthly.science}%</td><td>${s.monthly.english}%</td><td class="${s.daily.math==='Present'?'present':'absent'}">${s.daily.math}</td><td class="${s.daily.science==='Present'?'present':'absent'}">${s.daily.science}</td><td class="${s.daily.english==='Present'?'present':'absent'}">${s.daily.english}</td><td><b>${avg(s)}%</b></td><td><span class="status ${x[1]}">${x[0]}</span></td><td><button class="tiny edit" data-id="${s.id}">Edit</button> <button class="tiny delete" data-id="${s.id}">Delete</button></td></tr>`}));
 document.querySelectorAll('.edit').forEach(b=>b.onclick=()=>openEdit(+b.dataset.id));document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>removeStudent(+b.dataset.id))
}

function attendanceKey(){return `${$('attendanceDate').value}|${$('attendanceSubject').value}`;}
function renderDailyRegister(){
  const date=$('attendanceDate'), subject=$('attendanceSubject'), classFilter=$('attendanceClass');
  if(!date.value){const now=new Date();date.value=localDateKey(now);}
  const dateLabel = new Date(`${date.value}T00:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  $('attendanceDateLabel').textContent = dateLabel;
  const key=attendanceKey(), saved=attendanceRecords[key]||{};
  const list=students.filter(s=>classFilter.value==='All'||s.className===classFilter.value);
  $('dailyRegisterTable').innerHTML=table(['Student','Class','Attendance status'],list.map(s=>{
    const value=saved[s.id]||s.daily[subject.value]||'Present';
    return `<tr><td><b>${s.name}</b></td><td>${s.className}</td><td><select class="daily-status" data-student-id="${s.id}" aria-label="Attendance status for ${s.name}"><option value="Present" ${value==='Present'?'selected':''}>Present</option><option value="Absent" ${value==='Absent'?'selected':''}>Absent</option></select></td></tr>`;
  }));
  updateRegisterCounts();
}
function updateRegisterCounts(){
  const statuses=[...document.querySelectorAll('.daily-status')].map(el=>el.value);
  $('registerCount').textContent=`${statuses.length} student${statuses.length===1?'':'s'}`;
  $('presentCount').textContent=`Present: ${statuses.filter(x=>x==='Present').length}`;
  $('absentCount').textContent=`Absent: ${statuses.filter(x=>x==='Absent').length}`;
}
function setAllDailyStatus(value){document.querySelectorAll('.daily-status').forEach(el=>el.value=value);updateRegisterCounts();$('registerMessage').textContent='';}
function saveDailyAttendance(){
  const key=attendanceKey(), subject=$('attendanceSubject').value;
  attendanceRecords[key]={...(attendanceRecords[key]||{})};
  document.querySelectorAll('.daily-status').forEach(el=>{attendanceRecords[key][el.dataset.studentId]=el.value;});
  localStorage.setItem('eduAttendanceRecords',JSON.stringify(attendanceRecords));
  document.querySelectorAll('.daily-status').forEach(el=>{
    const s=students.find(x=>String(x.id)===el.dataset.studentId);
    if(s)s.daily[subject]=el.value;
  });
  save();$('registerMessage').textContent=`Saved ${document.querySelectorAll('.daily-status').length} attendance records for ${$('attendanceDate').value}.`;
  updateRegisterCounts();studentsPage();attendance();
}

function attendance(){
 let d=students;
 destroy('trend');charts.trend=new Chart($('trend'),{type:'line',data:{labels:['June','July','August','September','October'],datasets:[{label:'Average Monthly Attendance %',data:[84,86,88,87,monthlyAvg({monthly:{math:Math.round(d.reduce((a,s)=>a+s.monthly.math,0)/d.length),science:Math.round(d.reduce((a,s)=>a+s.monthly.science,0)/d.length),english:Math.round(d.reduce((a,s)=>a+s.monthly.english,0)/d.length)}})],tension:.35}]},options:{responsive:true,scales:{y:{min:50,max:100}}}});
 destroy('pie');charts.pie=new Chart($('attendancePie'),{type:'doughnut',data:{labels:['90%+','75–89%','Below 75%'],datasets:[{data:[d.filter(s=>s.attendance>=90).length,d.filter(s=>s.attendance>=75&&s.attendance<90).length,d.filter(s=>s.attendance<75).length]}]}});
 $('attendanceTable').innerHTML=table(['Student','Class','Date','Math Daily','Math Monthly','Science Daily','Science Monthly','English Daily','English Monthly','Overall'],d.map(s=>`<tr><td>${s.name}</td><td>${s.className}</td><td>${TODAY_LABEL}</td><td class="${s.daily.math==='Present'?'present':'absent'}">${s.daily.math}</td><td>${s.monthly.math}%</td><td class="${s.daily.science==='Present'?'present':'absent'}">${s.daily.science}</td><td>${s.monthly.science}%</td><td class="${s.daily.english==='Present'?'present':'absent'}">${s.daily.english}</td><td>${s.monthly.english}%</td><td><b>${s.attendance}%</b></td></tr>`))
}
function performance(){let d=students;destroy('subject');charts.subject=new Chart($('subjectChart'),{type:'bar',data:{labels:SUBJECTS,datasets:[{label:'Average %',data:SUBKEYS.map(k=>Math.round(d.reduce((a,s)=>a+s[k],0)/d.length))}]},options:{responsive:true,scales:{y:{beginAtZero:true,max:100}}}});destroy('ppie');charts.ppie=new Chart($('performancePie'),{type:'doughnut',data:{labels:['80%+','60–79%','Below 60%'],datasets:[{data:[d.filter(s=>avg(s)>=80).length,d.filter(s=>avg(s)>=60&&avg(s)<80).length,d.filter(s=>avg(s)<60).length]}]}});$('performanceTable').innerHTML=table(['Student','Class','Math','Science','English','Average'],d.map(s=>`<tr><td>${s.name}</td><td>${s.className}</td><td>${s.math}%</td><td>${s.science}%</td><td>${s.english}%</td><td><b>${avg(s)}%</b></td></tr>`))}
function insights(){let a=students.map(s=>s.attendance),b=students.map(s=>avg(s)),ma=a.reduce((x,y)=>x+y,0)/a.length,mb=b.reduce((x,y)=>x+y,0)/b.length,n=0,x=0,y=0;a.forEach((v,i)=>{let p=v-ma,q=b[i]-mb;n+=p*q;x+=p*p;y+=q*q});let corr=(n/Math.sqrt(x*y)||0).toFixed(2);$('insightsBox').innerHTML=[['🔎','Attendance–Performance Link',`Correlation: ${corr}. A positive value indicates stronger attendance tends to accompany stronger performance.`],['⚠️','Attendance Concern',`${students.filter(s=>s.attendance<75).length} student(s) are below 75% attendance.`],['🏆','High Achievers',`${students.filter(s=>s.attendance>=90&&avg(s)>=80).length} student(s) have 90%+ attendance and 80%+ average.`],['📚','Subject Focus',`Lowest monthly attendance subject: ${SUBJECTS[SUBKEYS.map(k=>students.reduce((a,s)=>a+s.monthly[k],0)/students.length).indexOf(Math.min(...SUBKEYS.map(k=>students.reduce((a,s)=>a+s.monthly[k],0)/students.length)))]}.`]].map(x=>`<div class="insight"><b>${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}
function openEdit(id){let s=students.find(x=>x.id===id);if(!s)return;editingId=id;$('modalTitle').textContent='Edit Student';let f=$('form');Object.keys(s).forEach(k=>{if(f.elements[k])f.elements[k].value=s[k]});$('modal').classList.remove('hidden')}
function removeStudent(id){let s=students.find(x=>x.id===id);if(s&&confirm(`Delete ${s.name}?`)){students=students.filter(x=>x.id!==id);save();refresh()}}
function exportCSV(){let heads=['Name','Class','Overall_Attendance','Mathematics_Daily','Mathematics_Monthly','Science_Daily','Science_Monthly','English_Daily','English_Monthly','Mathematics_Marks','Science_Marks','English_Marks','Performance_Average'];let csv=heads.join(',')+'\n'+students.map(s=>[s.name,s.className,s.attendance,s.daily.math,s.monthly.math,s.daily.science,s.monthly.science,s.daily.english,s.monthly.english,s.math,s.science,s.english,avg(s)].join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='attendance_performance_150_students.csv';a.click()}
function importCSV(file){let r=new FileReader();r.onload=()=>{let lines=r.result.trim().split(/\r?\n/).slice(1);let added=0;lines.forEach(line=>{let p=line.split(',').map(x=>x.trim());if(p.length>=6&&!isNaN(+p[2])){let m={math:+p[4]||+p[2],science:+p[6]||+p[2],english:+p[8]||+p[2]},dy={math:p[3]||'Present',science:p[5]||'Present',english:p[7]||'Present'};students.push({id:Date.now()+added,name:p[0],className:p[1],attendance:+p[2],monthly:m,daily:dy,math:+p[9]||0,science:+p[10]||0,english:+p[11]||0});added++}});save();refresh();alert(`${added} student record(s) imported.`)};r.readAsText(file)}
function quickFilters(){document.querySelectorAll('.quick[data-risk]').forEach(b=>b.onclick=()=>{$('riskFilter').value=b.dataset.risk;dashboard()});$('lowAttendance').onclick=()=>{$('riskFilter').value='risk';$('search').value='';dashboard();$('quickAlert').textContent='Showing students needing attendance attention'};$('resetFilters').onclick=()=>{$('classFilter').value='All';$('riskFilter').value='all';$('search').value='';$('quickAlert').textContent='';dashboard()};let low=students.filter(s=>s.attendance<75).length;$('quickAlert').textContent=low?`⚠ ${low} student${low>1?'s':''} below 75% attendance`:'✓ Attendance looks healthy'}
function refresh(){classes();dashboard();studentsPage();renderDailyRegister();attendance();performance();insights();quickFilters()}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(b.dataset.page).classList.add('active');refresh()});$('classFilter').onchange=dashboard;$('riskFilter').onchange=dashboard;$('search').oninput=dashboard;$('studentSearch').oninput=studentsPage;
$('add').onclick=()=>{editingId=null;$('modalTitle').textContent='Add Student';$('form').reset();$('modal').classList.remove('hidden')};$('close').onclick=()=>$('modal').classList.add('hidden');
$('form').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),obj={name:f.get('name'),className:f.get('className'),attendance:+f.get('attendance'),math:+f.get('math'),science:+f.get('science'),english:+f.get('english'),monthly:{math:+f.get('attendance'),science:+f.get('attendance'),english:+f.get('attendance')},daily:{math:'Present',science:'Present',english:'Present'}};if(editingId)Object.assign(students.find(s=>s.id===editingId),obj);else students.push({id:Date.now(),...obj});save();$('modal').classList.add('hidden');e.target.reset();refresh()};
$('export').onclick=exportCSV;$('importBtn').onclick=()=>$('fileInput').click();$('fileInput').onchange=e=>e.target.files[0]&&importCSV(e.target.files[0]);$('print').onclick=()=>window.print();$('theme').onclick=()=>document.body.classList.toggle('dark');
$('attendanceDate').onchange=renderDailyRegister;$('attendanceSubject').onchange=renderDailyRegister;$('attendanceClass').onchange=renderDailyRegister;
$('dailyRegisterTable').addEventListener('change',e=>{if(e.target.classList.contains('daily-status'))updateRegisterCounts()});
$('markAllPresent').onclick=()=>setAllDailyStatus('Present');$('markAllAbsent').onclick=()=>setAllDailyStatus('Absent');$('saveAttendance').onclick=saveDailyAttendance;
if($('attendanceDate')){$('attendanceDate').value = TODAY_KEY;}
refresh();
