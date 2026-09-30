const FORM_ENDPOINT = "https://formspree.io/f/mjykzged";

const $ = id => document.getElementById(id);
const music = $('music');
const effects = [$('jump-audio'), $('hit-audio'), $('coin-audio')];
const buttonAudio = $('button-audio');
buttonAudio.volume = 0.28;
music.volume = 0.12;
effects.forEach(audio => { audio.volume = 0.65; });
let started = false, jumping = false, hit = false, muted = false;
let startTime = 0, position = 0, queuedJump = false;

function play(audio) {
  if (muted) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function targetX() { return $('world').clientWidth * 0.65 - 50; }
function pose(name) { $('sprite').className = `sprite pose-${name}`; }
function move(x, y = 0) {
  position = x;
  $('runner').style.transform = `translate(${x}px, ${-y}px)`;
}

$('start').addEventListener('click', () => {
  if (started) return;
  started = true;
  play(music);
  play(buttonAudio);
  // Unlock each supplied sound in the user's START gesture, including on iOS.
  effects.forEach(audio => {
    audio.muted = true;
    const unlocked = audio.play();
    if (unlocked) unlocked.then(() => {
      audio.pause(); audio.currentTime = 0; audio.muted = muted;
    }).catch(() => { audio.muted = muted; });
  });
  $('intro').hidden = true;
  $('scene').hidden = false;
  $('runner').classList.add('running');
  $('scene').classList.add('entering');
  startTime = performance.now();
  requestAnimationFrame(run);
});

function run(now) {
  if (jumping || hit) return;
  const progress = Math.min((now - startTime) / 2000, 1);
  const travel = progress < 0.8 ? progress / 0.9 : 1 - Math.pow((1 - progress) / 0.2, 2) / 9;
  const step = Math.floor((now - startTime) / (progress > 0.85 ? 150 : 105)) % 4;
  pose(['run-one', 'run-two', 'run-three', 'run-two'][step]);
  move(12 + (targetX() - 12) * travel, step % 2 ? 1.5 : 0);
  // An early tap is buffered until the last part of the approach.
  if (queuedJump && progress >= 0.72) { jump(); return; }
  if (progress < 1) requestAnimationFrame(run);
  else {
    $('runner').classList.remove('running');
    move(targetX());
    pose('land');
    $('hint').textContent = 'Ci sei! Premi JUMP.';
  }
}

function requestJump() {
  if (!started || jumping || hit || queuedJump) return;
  if (performance.now() - startTime < 1440) {
    queuedJump = true;
    $('hint').textContent = 'Salto pronto… eccoci!';
  } else jump();
}

function jump() {
  queuedJump = false; jumping = true;
  $('jump').disabled = true;
  $('runner').classList.remove('running');
  pose('jump');
  play(effects[0]);
  const from = position, began = performance.now();
  // Match the arc to the underside of the block at every viewport height.
  const blockBottom = parseFloat(getComputedStyle($('block')).bottom);
  const height = blockBottom - 36 - 118 + 9;
  function frame(now) {
    const t = Math.min((now - began) / 740, 1);
    move(from + (targetX() - from) * Math.min(t * 2.5, 1), 4 * height * t * (1 - t));
    pose(t < 0.52 ? 'jump' : 'celebrate');
    if (t >= 0.47 && !hit) hitBlock();
    if (t < 1) requestAnimationFrame(frame);
    else {
      jumping = false; move(targetX()); pose('land');
      $('runner').classList.add('landing');
    }
  }
  requestAnimationFrame(frame);
}

function hitBlock() {
  hit = true;
  $('block').classList.add('hit');
  $('coin').classList.add('pop');
  $('sparkles').classList.add('on');
  $('hint').textContent = 'È tuo!';
  play(effects[1]);
  setTimeout(() => play(effects[2]), 85);
  setTimeout(() => {
    $('reveal-wipe').classList.add('active');
    $('scene').classList.add('leaving');
    // The star fills the screen before revealing the gift underneath.
    setTimeout(() => {
      music.pause();
      $('scene').hidden = true;
      $('gift').hidden = false;
      document.body.classList.add('revealed');
      $('gift-title').setAttribute('tabindex', '-1');
      $('gift-title').focus({ preventScroll: true });
    }, 300);
    setTimeout(() => $('reveal-wipe').classList.remove('active'), 1000);
  }, 680);
}

$('jump').addEventListener('click', requestJump);
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && !$('scene').hidden) {
    event.preventDefault(); requestJump();
  }
});
$('mute').addEventListener('click', () => {
  muted = !muted;
  [music, ...effects, buttonAudio].forEach(audio => { audio.muted = muted; });
  $('mute').textContent = muted ? '×' : '♫';
  $('mute').setAttribute('aria-label', muted ? 'Attiva audio' : 'Disattiva audio');
  $('mute').setAttribute('aria-pressed', String(muted));
});
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.remove('pressed');
    void button.offsetWidth;
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 400);
    if (button.id !== 'start' && button.id !== 'jump') play(buttonAudio);
  });
});
window.addEventListener('resize', () => {
  if (started && !jumping && !hit && performance.now() - startTime >= 2000) move(targetX());
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (started && !hit && !muted) music.play().catch(() => {});
});

let submitting = false;
$('gift-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting || !event.target.reportValidity()) return;
  const status = $('form-status');
  submitting = true;
  $('submit').disabled = true;
  event.target.setAttribute('aria-busy', 'true');
  status.textContent = 'Invio in corso…';
  try {
    const data = new FormData(event.target);
    data.set('email_nintendo', $('email').value.trim());
    data.set('_source', 'Marco Nintendo Gift');
    data.set('_subject', 'Nintendo Gift — Email Marco');
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST', body: data, headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error('Invio non riuscito');
    $('form-section').hidden = true;
    $('complete').hidden = false;
    $('complete').focus({ preventScroll: true });
  } catch {
    status.textContent = 'Qualcosa non ha funzionato. Riprova.';
  } finally {
    submitting = false;
    $('submit').disabled = false;
    event.target.removeAttribute('aria-busy');
  }
});
