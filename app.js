let allQuestions = QUESTION_BANK;
let questions = [];
let current = 0;
let selected = [];
let answers = [];
let locked = false;
let timer = null;

const $ = id => document.getElementById(id);
const typeName = t => t === 'single' ? '单选题' : t === 'multi' ? '多选题' : '简答题';
const sourceName = s => s.includes('自控') ? '自控专业试题_0228' : 'GE机组培训题库';

function initFilters() {
  const sources = [...new Set(allQuestions.map(q => q.source))];
  $('sourceFilter').innerHTML = '<option value="all">全部题库</option>' + sources.map(s => `<option value="${s}">${sourceName(s)}</option>`).join('');
  $('typeFilter').innerHTML = '<option value="all">全部题型</option><option value="single">单选题</option><option value="multi">多选题</option><option value="short">简答题</option>';
  $('sourceFilter').onchange = applyFilters;
  $('typeFilter').onchange = applyFilters;
}
function applyFilters() {
  const source = $('sourceFilter').value, type = $('typeFilter').value;
  questions = allQuestions.filter(q => (source === 'all' || q.source === source) && (type === 'all' || q.type === type));
  current = 0; selected = []; answers = []; locked = false;
  if (!questions.length) { $('questionTitle').textContent = '当前筛选没有题目'; $('options').innerHTML = ''; return; }
  render();
}
function render() {
  const q = questions[current];
  selected = answers[current]?.selected || [];
  locked = Boolean(answers[current]);
  $('questionTitle').textContent = `${current + 1}. ${q.question}`;
  $('category').textContent = `${sourceName(q.source)} · ${typeName(q.type)}`;
  $('questionType').textContent = typeName(q.type);
  const pct = Math.round((current + 1) / questions.length * 100);
  $('progressText').textContent = `第 ${current + 1} / ${questions.length} 题`;
  $('progressPercent').textContent = pct + '%'; $('progressBar').style.width = pct + '%';
  $('options').innerHTML = q.type === 'short' ? `<textarea id="shortAnswer" class="short-answer" placeholder="请在这里写下你的答案，提交后查看参考答案……">${locked ? (answers[current].input || '') : ''}</textarea>` : q.options.map(o => `<button class="option ${selected.includes(o.key) ? 'selected' : ''}" data-key="${o.key}"><span class="letter">${o.key}</span><span>${o.text}</span></button>`).join('');
  document.querySelectorAll('.option').forEach(btn => btn.onclick = () => choose(btn.dataset.key));
  $('feedback').className = 'feedback hidden';
  $('hint').textContent = q.type === 'multi' ? '请选择全部正确答案' : q.type === 'short' ? '简答题提交后显示参考答案，不进行机械判分' : '请选择一个答案';
  if (locked) showFeedback(answers[current], false);
  $('submitBtn').disabled = locked; $('submitBtn').textContent = locked ? '已提交' : '提交答案';
  $('prevBtn').disabled = current === 0; $('nextBtn').disabled = current === questions.length - 1;
  renderGrid(); updateStats();
}
function choose(key) {
  if (locked) return;
  if (questions[current].type === 'single') selected = [key];
  else selected = selected.includes(key) ? selected.filter(x => x !== key) : [...selected, key];
  document.querySelectorAll('.option').forEach(el => el.classList.toggle('selected', selected.includes(el.dataset.key)));
  $('hint').textContent = questions[current].type === 'multi' ? `已选择 ${selected.length} 项，请提交答案` : `已选择 ${key}，请提交答案`;
}
function submit() {
  if (locked) return;
  const q = questions[current];
  if (q.type === 'short') {
    const input = $('shortAnswer').value.trim(); if (!input) return toast('请先填写答案');
    answers[current] = { selected: [], input, correct: null }; locked = true; showFeedback(answers[current], true); renderGrid(); updateStats(); return;
  }
  if (!selected.length) return toast('请先选择答案');
  const correct = selected.slice().sort().join('') === q.answer.slice().sort().join('');
  answers[current] = { selected: [...selected], correct }; locked = true; showFeedback(answers[current], true); renderGrid(); updateStats();
  if (correct && $('modeToggle').checked && current < questions.length - 1) timer = setTimeout(() => { current++; render(); }, 1300);
}
function showFeedback(result, announce) {
  const q = questions[current];
  if (q.type === 'short') {
    $('feedback').className = 'feedback success'; $('feedbackIcon').textContent = '✓'; $('feedbackTitle').textContent = '已记录，请对照参考答案学习'; $('feedbackAnswer').textContent = '参考答案：'; $('explanation').textContent = q.explanation || '原题未提供参考答案。'; return;
  }
  const els = document.querySelectorAll('.option'); els.forEach(el => { el.disabled = true; const key = el.dataset.key; if (q.answer.includes(key)) el.classList.add('correct'); else if (result.selected.includes(key)) el.classList.add('incorrect'); });
  $('feedback').className = 'feedback ' + (result.correct ? 'success' : 'error'); $('feedbackIcon').textContent = result.correct ? '✓' : '!'; $('feedbackTitle').textContent = result.correct ? '回答正确！即将进入下一题' : '回答错误，先看看解析再继续学习'; $('feedbackAnswer').textContent = `正确答案：${q.answer.join('、')}`; $('explanation').textContent = q.explanation || '题库中未提供额外解析。'; if (announce && result.correct) toast('回答正确，做得很好！');
}
function renderGrid() {
  $('questionGrid').innerHTML = questions.map((q, i) => { const a = answers[i]; const cls = i === current ? 'current' : a?.correct === true ? 'done' : a?.correct === false ? 'wrong' : a ? 'done' : ''; return `<button class="q-number ${cls}" data-q="${i}">${i + 1}</button>`; }).join('');
  document.querySelectorAll('.q-number').forEach(b => b.onclick = () => { clearTimeout(timer); current = Number(b.dataset.q); render(); });
  $('completedCount').textContent = `${answers.filter(Boolean).length}/${questions.length}`;
}
function updateStats() { const done = answers.filter(Boolean), graded = done.filter(a => typeof a.correct === 'boolean'), correct = graded.filter(a => a.correct).length, wrong = graded.filter(a => !a.correct).length; $('correctStat').textContent = correct; $('wrongStat').textContent = wrong; $('wrongCount').textContent = wrong; $('accuracyStat').textContent = graded.length ? Math.round(correct / graded.length * 100) + '%' : '—'; }
function move(step) { clearTimeout(timer); const target = current + step; if (target >= 0 && target < questions.length) { current = target; render(); } }
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1600); }
$('submitBtn').onclick = submit; $('prevBtn').onclick = () => move(-1); $('nextBtn').onclick = () => move(1); initFilters(); applyFilters();
