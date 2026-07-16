const questions=[
 {category:'计算机基础',title:'下列哪一项属于操作系统？',options:['Microsoft Word','Windows 11','Adobe Photoshop','Google Chrome'],answer:1,explanation:'Windows 11 是由微软开发的操作系统，负责管理计算机硬件、软件资源并为应用程序提供运行环境。'},
 {category:'信息技术',title:'在计算机中，CPU 的中文名称是什么？',options:['中央处理器','随机存储器','只读存储器','图形处理器'],answer:0,explanation:'CPU 是 Central Processing Unit 的缩写，中文名称为“中央处理器”，是计算机的核心运算与控制部件。'},
 {category:'网络基础',title:'通常用于访问网页的协议是？',options:['HTTP / HTTPS','FTP','SMTP','SSH'],answer:0,explanation:'浏览器访问网页通常使用 HTTP 或更安全的 HTTPS 协议。'},
 {category:'办公软件',title:'Excel 工作簿文件最常见的扩展名是？',options:['.docx','.pptx','.xlsx','.txt'],answer:2,explanation:'.xlsx 是现代 Microsoft Excel 工作簿的默认文件扩展名。'},
 {category:'网络安全',title:'下面哪种密码相对更安全？',options:['12345678','password','生日日期','包含大小写字母、数字和符号的长密码'],answer:3,explanation:'长度足够且混合大小写字母、数字和特殊符号的密码更难被猜测或暴力破解。'}
];
let current=0,selected=null,answers=Array(questions.length).fill(null),locked=false,timer=null;
const $=id=>document.getElementById(id);
function render(){
 const q=questions[current],answered=answers[current]; selected=answered?.selected??null; locked=Boolean(answered);
 $('questionTitle').textContent=`${current+1}. ${q.title}`;$('category').textContent=q.category;
 $('progressText').textContent=`第 ${current+1} / ${questions.length} 题`;const pct=Math.round((current+1)/questions.length*100);$('progressPercent').textContent=pct+'%';$('progressBar').style.width=pct+'%';
 $('options').innerHTML=q.options.map((text,i)=>`<button class="option ${selected===i?'selected':''}" data-index="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${text}</span></button>`).join('');
 document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>choose(Number(btn.dataset.index))));
 $('feedback').className='feedback hidden';$('hint').textContent=locked?'本题已作答，可查看解析或切换题目':'请选择一个答案';
 if(locked) showFeedback(answered,false);
 $('prevBtn').disabled=current===0;$('nextBtn').disabled=current===questions.length-1;$('submitBtn').disabled=locked;$('submitBtn').textContent=locked?'已提交':'提交答案';
 renderGrid();updateStats();
}
function choose(i){if(locked)return;selected=i;document.querySelectorAll('.option').forEach((el,n)=>el.classList.toggle('selected',n===i));$('hint').textContent=`已选择 ${String.fromCharCode(65+i)}，请提交答案`;}
function submit(){if(locked)return;if(selected===null){toast('请先选择一个答案');return}const correct=selected===questions[current].answer;answers[current]={selected,correct};locked=true;showFeedback(answers[current],true);renderGrid();updateStats();$('submitBtn').disabled=true;$('submitBtn').textContent='已提交';if(correct&&$('modeToggle').checked&&current<questions.length-1){clearTimeout(timer);timer=setTimeout(()=>{current++;render()},1300)}}
function showFeedback(result,announce){
 const q=questions[current],els=document.querySelectorAll('.option');els.forEach((el,i)=>{el.disabled=true;el.classList.remove('selected');if(i===q.answer)el.classList.add('correct');else if(i===result.selected)el.classList.add('incorrect')});
 $('feedback').className='feedback '+(result.correct?'success':'error');$('feedbackIcon').textContent=result.correct?'✓':'!';$('feedbackTitle').textContent=result.correct?'回答正确！即将进入下一题':'回答错误，先看看解析再试下一题';$('feedbackAnswer').textContent=`正确答案：${String.fromCharCode(65+q.answer)}. ${q.options[q.answer]}`;$('explanation').textContent='解析：'+q.explanation;if(announce&&result.correct)toast('回答正确，做得很好！');
}
function renderGrid(){
 $('questionGrid').innerHTML=questions.map((_,i)=>{let cls=i===current?'current':answers[i]?.correct?'done':answers[i]?'wrong':'';return `<button class="q-number ${cls}" data-q="${i}">${i+1}</button>`}).join('');document.querySelectorAll('.q-number').forEach(b=>b.onclick=()=>{clearTimeout(timer);current=Number(b.dataset.q);render()});
 $('completedCount').textContent=`${answers.filter(Boolean).length}/${questions.length}`;$('wrongCount').textContent=answers.filter(a=>a&&!a.correct).length;
}
function updateStats(){const done=answers.filter(Boolean),correct=done.filter(a=>a.correct).length,wrong=done.length-correct;$('correctStat').textContent=correct;$('wrongStat').textContent=wrong;$('wrongCount').textContent=wrong;$('accuracyStat').textContent=done.length?Math.round(correct/done.length*100)+'%':'0%'}
function move(step){clearTimeout(timer);const target=current+step;if(target>=0&&target<questions.length){current=target;render()}}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
$('submitBtn').onclick=submit;$('prevBtn').onclick=()=>move(-1);$('nextBtn').onclick=()=>move(1);render();
