/* =============================================
   OIBSIP Task 2 — ThermoConvert · script.js
   ============================================= */

'use strict';

/* ── DOM refs ── */
const tempInput    = document.getElementById('tempInput');
const inputWrap    = document.getElementById('inputWrap');
const inputError   = document.getElementById('inputError');
const unitBadge    = document.getElementById('unitBadge');
const convertBtn   = document.getElementById('convertBtn');
const valC         = document.getElementById('valC');
const valF         = document.getElementById('valF');
const valK         = document.getElementById('valK');
const resC         = document.getElementById('resC');
const resF         = document.getElementById('resF');
const resK         = document.getElementById('resK');
const specialMsg   = document.getElementById('specialMsg');
const feelBarWrap  = document.getElementById('feelBarWrap');
const feelBarFill  = document.getElementById('feelBarFill');
const feelMarker   = document.getElementById('feelMarker');
const feelTag      = document.getElementById('feelTag');
const unitRadios   = document.querySelectorAll('input[name="unit"]');

/* ── Absolute-zero limits per unit ── */
const ABS_ZERO = { C: -273.15, F: -459.67, K: 0 };

/* ── Unit badge labels ── */
const BADGE_LABEL = { C: '°C', F: '°F', K: 'K' };

/* ── Conversion formulas (all via Celsius) ── */
function toCelsius(val, unit) {
  if (unit === 'C') return val;
  if (unit === 'F') return (val - 32) * 5 / 9;
  if (unit === 'K') return val - 273.15;
}

function fromCelsius(celsius) {
  return {
    C: celsius,
    F: celsius * 9 / 5 + 32,
    K: celsius + 273.15,
  };
}

/* ── Get selected unit ── */
function getUnit() {
  for (const r of unitRadios) if (r.checked) return r.value;
  return 'C';
}

/* ── Validate input ── */
function validate(raw, unit) {
  if (raw.trim() === '' || raw === null) {
    return { ok: false, msg: '⚠ Please enter a temperature value.' };
  }
  if (isNaN(Number(raw))) {
    return { ok: false, msg: '⚠ Only numeric values are allowed. Letters and symbols are not valid.' };
  }
  const num = Number(raw);
  if (num < ABS_ZERO[unit]) {
    const limit = ABS_ZERO[unit];
    const unitLabel = BADGE_LABEL[unit];
    return {
      ok: false,
      msg: `⚠ Value cannot be below absolute zero (${limit}${unitLabel}). Physical temperatures below this don't exist.`,
      absZero: true,
    };
  }
  return { ok: true, val: num };
}

/* ── Format number: max 4 decimal places, trim trailing zeros ── */
function fmt(n) {
  if (Math.abs(n) >= 1e9) return n.toExponential(2);
  return parseFloat(n.toFixed(4)).toString();
}

/* ── Feel-bar: maps Celsius to 0-100% position ── */
const FEEL_CONFIG = [
  { max: -20,  label: '🥶 Extreme Cold',  pct:  2  },
  { max:   0,  label: '❄️ Freezing',       pct: 18  },
  { max:  10,  label: '🌬 Cold',           pct: 28  },
  { max:  20,  label: '🍃 Cool',           pct: 40  },
  { max:  28,  label: '☀️ Comfortable',    pct: 55  },
  { max:  37,  label: '🌡️ Warm',           pct: 68  },
  { max:  45,  label: '🔥 Hot',            pct: 82  },
  { max: Infinity, label: '🌋 Extreme Heat', pct: 98 },
];

function updateFeelBar(celsius) {
  let pct = 0;
  let label = '';
  for (const f of FEEL_CONFIG) {
    if (celsius <= f.max) { pct = f.pct; label = f.label; break; }
  }
  feelBarFill.style.width  = (100 - pct) + '%';  /* dim overlay shrinks */
  feelMarker.style.left    = pct + '%';
  feelTag.textContent      = label;
  feelBarWrap.classList.add('visible');
}

/* ── Show/clear error ── */
function showError(msg, isAbsZero = false) {
  inputError.textContent = msg;
  tempInput.classList.add('input--error');
  tempInput.classList.remove('input--valid');
  /* Shake the input */
  inputWrap.classList.remove('shake');
  void inputWrap.offsetWidth; // reflow
  inputWrap.classList.add('shake');

  if (isAbsZero) {
    specialMsg.textContent = '🧊 Absolute zero (−273.15°C / −459.67°F / 0 K) is the lowest physically possible temperature — reached when all molecular motion stops.';
    specialMsg.className = 'special-msg msg--warning';
  }
}

function clearError() {
  inputError.textContent = '';
  tempInput.classList.remove('input--error');
  specialMsg.textContent = '';
  specialMsg.className = 'special-msg';
}

/* ── Highlight the source unit result card ── */
function highlightSource(unit) {
  [resC, resF, resK].forEach(c => c.classList.remove('result--active'));
  const map = { C: resC, F: resF, K: resK };
  map[unit].classList.add('result--active');
}

/* ── Main convert logic ── */
function convert() {
  const raw  = tempInput.value;
  const unit = getUnit();

  clearError();

  const check = validate(raw, unit);

  if (!check.ok) {
    showError(check.msg, check.absZero);
    /* Reset result values */
    [valC, valF, valK].forEach(el => { el.textContent = '—'; });
    [resC, resF, resK].forEach(c => c.classList.remove('result--active'));
    feelBarWrap.classList.remove('visible');
    return;
  }

  /* Valid — compute */
  const celsius  = toCelsius(check.val, unit);
  const results  = fromCelsius(celsius);

  valC.textContent = fmt(results.C);
  valF.textContent = fmt(results.F);
  valK.textContent = fmt(results.K);

  tempInput.classList.add('input--valid');
  highlightSource(unit);

  /* Absolute zero exactly */
  if (celsius === -273.15) {
    specialMsg.textContent = '🧊 This is absolute zero — the coldest possible temperature. All molecular motion ceases.';
    specialMsg.className = 'special-msg msg--info';
  }

  updateFeelBar(celsius);
}

/* ── Event: Convert button ── */
convertBtn.addEventListener('click', convert);

/* ── Event: Enter key on input ── */
tempInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') convert();
});

/* ── Event: Real-time non-numeric rejection ── */
tempInput.addEventListener('input', () => {
  const raw = tempInput.value;
  /* If field has a value that's not a number */
  if (raw !== '' && raw !== '-' && raw !== '.' && raw !== '-.' && isNaN(Number(raw))) {
    inputError.textContent = '⚠ Only numeric input is accepted.';
    tempInput.classList.add('input--error');
  } else {
    inputError.textContent = '';
    tempInput.classList.remove('input--error');
  }
});

/* ── Event: Unit radio change → update badge, clear results ── */
unitRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    unitBadge.textContent = BADGE_LABEL[radio.value];
    clearError();
    /* If input already has a value, re-convert */
    if (tempInput.value.trim() !== '') convert();
  });
});

/* ── Init badge ── */
unitBadge.textContent = BADGE_LABEL[getUnit()];
