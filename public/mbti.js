/**
 * MBTI 三十題測驗：計分依據 E/I、S/N、T/F、J/P 四維度加總。
 * 結果說明文字載入自 mbti-types.json（內容對應專案內 MBTI_16人格特質總覽.md）。
 */

const LIKERT_LABELS = [
  { value: 1, label: '非常不同意' },
  { value: 2, label: '不同意' },
  { value: 3, label: '普通' },
  { value: 4, label: '同意' },
  { value: 5, label: '非常同意' }
];

/**
 * axis: EI | SN | TF | JP
 * target: 該題「同意」所支持的一端（E,I,S,N,T,F,J,P）
 */
const QUESTIONS = [
  { id: 1, axis: 'EI', target: 'I', text: '參加大型聚會或長時間社交後，我往往需要獨處才能恢復精神。' },
  { id: 2, axis: 'EI', target: 'E', text: '在陌生場合，我通常能自在地主動與人交談。' },
  { id: 3, axis: 'EI', target: 'E', text: '與人互動時，我整體感覺精力充沛、受到鼓舞。' },
  { id: 4, axis: 'EI', target: 'I', text: '我發言前習慣先觀察與內在整理，再慢慢說出想法。' },
  { id: 5, axis: 'EI', target: 'E', text: '我認為自己從人群、活動與外部互動中獲得能量。' },
  { id: 6, axis: 'EI', target: 'I', text: '我偏好小圈圈的深度對話，勝過大場面的寒暄。' },
  { id: 7, axis: 'EI', target: 'E', text: '在團隊中，我傾向主動表達意見並承擔串聯角色。' },
  { id: 8, axis: 'EI', target: 'I', text: '長時間社交後，我通常需要安靜時間獨處。' },

  { id: 9, axis: 'SN', target: 'S', text: '我較常注意具體事實與細節，而非整體的可能性。' },
  { id: 10, axis: 'SN', target: 'N', text: '我喜歡討論新想法、模式與未來可能，而非只聚焦已發生的事。' },
  { id: 11, axis: 'SN', target: 'S', text: '我做決策時，重視過去經驗與實際案例。' },
  { id: 12, axis: 'SN', target: 'N', text: '我習慣用概念與比喻來理解世界。' },
  { id: 13, axis: 'SN', target: 'S', text: '我比較關心「現在實際是什麼」，而非「可能會變成什麼」。' },
  { id: 14, axis: 'SN', target: 'N', text: '我會主動找尋不同領域之間的關聯與模式。' },
  { id: 15, axis: 'SN', target: 'S', text: '我偏好按部就班、有明確步驟的指引。' },
  { id: 16, axis: 'SN', target: 'N', text: '我喜歡思考抽象理論與長期願景。' },

  { id: 17, axis: 'TF', target: 'T', text: '做決策時，我優先考量邏輯一致與公平。' },
  { id: 18, axis: 'TF', target: 'F', text: '做決策時，我優先考量人的感受與關係和諧。' },
  { id: 19, axis: 'TF', target: 'T', text: '給予回饋時，我傾向直率指出問題，即使可能造成尷尬。' },
  { id: 20, axis: 'TF', target: 'F', text: '我傾向避免衝突，即使需要稍作妥協。' },
  { id: 21, axis: 'TF', target: 'T', text: '我認為規則面前人人平等，應一致適用。' },
  { id: 22, axis: 'TF', target: 'F', text: '我更在意決策是否讓人感到被尊重與理解。' },
  { id: 23, axis: 'TF', target: 'T', text: '爭論中我較能與人對事論事、不牽涉個人情緒。' },

  { id: 24, axis: 'JP', target: 'J', text: '我喜歡在期限前完成事項，並事先列出計畫。' },
  { id: 25, axis: 'JP', target: 'P', text: '我偏好保持彈性，依當下情況再調整。' },
  { id: 26, axis: 'JP', target: 'J', text: '我對待辦清單與時間表感到安心。' },
  { id: 27, axis: 'JP', target: 'P', text: '我喜歡保留開放選項，直到最後一刻再決定。' },
  { id: 28, axis: 'JP', target: 'J', text: '我傾向盡快結論並推進，而非一再延後決定。' },
  { id: 29, axis: 'JP', target: 'P', text: '我喜歡探索多種可能，勝過一次定案。' },
  { id: 30, axis: 'JP', target: 'J', text: '我的環境通常整齊有序、物品有固定位置。' }
];

const AXIS_CONFIG = {
  EI: { first: 'E', second: 'I', count: 8, threshold: 16 },
  SN: { first: 'S', second: 'N', count: 8, threshold: 16 },
  TF: { first: 'T', second: 'F', count: 7, threshold: 14 },
  JP: { first: 'J', second: 'P', count: 7, threshold: 14 }
};

let mbtiTypesData = null;

function contribution(answer, target, firstLetter) {
  const v = Number(answer);
  if (target === firstLetter) return v - 1;
  return 5 - v;
}

function scoreAxis(answers, axisKey) {
  const cfg = AXIS_CONFIG[axisKey];
  const first = cfg.first;
  let sumFirst = 0;
  for (const q of QUESTIONS) {
    if (q.axis !== axisKey) continue;
    const a = answers[q.id];
    if (a == null || a < 1 || a > 5) return null;
    sumFirst += contribution(a, q.target, first);
  }
  const letter = sumFirst >= cfg.threshold ? first : cfg.second;
  const nearMid = Math.abs(sumFirst - cfg.threshold) <= 1;
  return { sumFirst, letter, max: cfg.count * 4, threshold: cfg.threshold, nearMid };
}

function computeType(answers) {
  const ei = scoreAxis(answers, 'EI');
  const sn = scoreAxis(answers, 'SN');
  const tf = scoreAxis(answers, 'TF');
  const jp = scoreAxis(answers, 'JP');
  if (!ei || !sn || !tf || !jp) return null;
  const code = `${ei.letter}${sn.letter}${tf.letter}${jp.letter}`;
  return {
    code,
    ei,
    sn,
    tf,
    jp,
    borderline: [ei, sn, tf, jp].filter((x) => x.nearMid)
  };
}

async function loadMbtiTypes() {
  if (mbtiTypesData) return mbtiTypesData;
  const res = await fetch('/mbti-types.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('無法載入人格資料');
  mbtiTypesData = await res.json();
  return mbtiTypesData;
}

function renderQuiz(root, answers, onChange) {
  root.innerHTML = '';
  const form = document.createElement('div');
  form.className = 'quiz-form';
  QUESTIONS.forEach((q) => {
    const block = document.createElement('fieldset');
    block.className = 'question-block';
    const legend = document.createElement('legend');
    legend.textContent = `第 ${q.id} 題`;
    block.appendChild(legend);
    const p = document.createElement('p');
    p.className = 'question-text';
    p.textContent = q.text;
    block.appendChild(p);
    const opts = document.createElement('div');
    opts.className = 'likert-row';
    LIKERT_LABELS.forEach((opt) => {
      const id = `q${q.id}_v${opt.value}`;
      const label = document.createElement('label');
      label.className = 'likert-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${q.id}`;
      input.value = String(opt.value);
      input.id = id;
      if (answers[q.id] === opt.value) input.checked = true;
      input.addEventListener('change', () => {
        answers[q.id] = opt.value;
        onChange();
      });
      const span = document.createElement('span');
      span.textContent = opt.label;
      label.appendChild(input);
      label.appendChild(span);
      opts.appendChild(label);
    });
    block.appendChild(opts);
    form.appendChild(block);
  });
  root.appendChild(form);
}

function renderResult(container, result, typeInfo) {
  const { code, ei, sn, tf, jp, borderline } = result;
  const t = typeInfo[code];
  const borderNote =
    borderline && borderline.length
      ? `<p class="borderline-note">部分維度分數接近中線，結果僅供參考，實際可能介於兩端之間。</p>`
      : '';

  container.innerHTML = `
    <div class="result-card">
      <p class="result-label">你的 MBTI 類型</p>
      <h2 class="result-code">${code}</h2>
      <p class="result-nickname">${t ? `「${t.nickname}」` : ''} · ${t ? t.familyName : ''}（${t ? t.family : ''}）</p>
      ${borderNote}
      <div class="result-scores">
        <div class="score-bar"><span>能量（E/I）</span><span>E ${ei.sumFirst} / ${ei.max} → ${ei.letter}</span></div>
        <div class="score-bar"><span>資訊（S/N）</span><span>S ${sn.sumFirst} / ${sn.max} → ${sn.letter}</span></div>
        <div class="score-bar"><span>決策（T/F）</span><span>T ${tf.sumFirst} / ${tf.max} → ${tf.letter}</span></div>
        <div class="score-bar"><span>生活風格（J/P）</span><span>J ${jp.sumFirst} / ${jp.max} → ${jp.letter}</span></div>
      </div>
      ${
        t
          ? `
      <section class="type-detail">
        <h3>常見焦點關鍵字</h3>
        <p>${t.keywords}</p>
        <h3>核心特質</h3>
        <p>${t.core}</p>
        <h3>優勢</h3>
        <p>${t.strengths}</p>
        <h3>挑戰</h3>
        <p>${t.challenges}</p>
        <h3>人際與職涯（網路常見觀察）</h3>
        <p>${t.career}</p>
      </section>`
          : ''
      }
      <p class="disclaimer">
        本測驗為簡化自評工具，結果僅供自我探索參考，不能替代專業 MBTI 施測或心理醫療診斷。
      </p>
    </div>
  `;
}

function init() {
  const answers = {};
  const quizRoot = document.getElementById('quizRoot');
  const resultRoot = document.getElementById('resultRoot');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnReset = document.getElementById('btnReset');
  const progress = document.getElementById('progress');

  function updateProgress() {
    const done = QUESTIONS.filter((q) => answers[q.id] != null).length;
    progress.textContent = `已作答 ${done} / ${QUESTIONS.length}`;
    btnSubmit.disabled = done < QUESTIONS.length;
  }

  renderQuiz(quizRoot, answers, updateProgress);
  updateProgress();

  btnSubmit.addEventListener('click', async () => {
    const result = computeType(answers);
    if (!result) {
      alert('請完成所有題目。');
      return;
    }
    try {
      const types = await loadMbtiTypes();
      renderResult(resultRoot, result, types);
      resultRoot.hidden = false;
      resultRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      console.error(e);
      alert('載入人格說明失敗，請確認已使用專案附帶的伺服器開啟網頁。');
    }
  });

  btnReset.addEventListener('click', () => {
    QUESTIONS.forEach((q) => {
      delete answers[q.id];
    });
    renderQuiz(quizRoot, answers, updateProgress);
    updateProgress();
    resultRoot.hidden = true;
    resultRoot.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
