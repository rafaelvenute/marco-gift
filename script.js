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

// Fit the full coin arc and sparkles within the available world height.
function layoutWorld() {
  const world = $('world');
  if (!world.clientHeight) return;
  const scale = Math.min(1, (world.clientHeight - 24) / 300);
  const blockBottom = Math.min(215 * scale, world.clientHeight - 24 - 120 * scale);
  const coinBottom = blockBottom + 58 * scale;
  const coinRise = Math.min(65 * scale, world.clientHeight - 16 - coinBottom - 34 * scale);
  world.style.setProperty('--actor-scale', scale);
  world.style.setProperty('--block-bottom', `${blockBottom}px`);
  world.style.setProperty('--coin-bottom', `${coinBottom}px`);
  world.style.setProperty('--coin-rise', `${coinRise}px`);
  world.style.setProperty('--sparkles-bottom', `${Math.min(coinBottom, world.clientHeight - 70 * scale - 16)}px`);
}
function targetX() { return $('world').clientWidth * 0.65 - $('runner').offsetWidth / 2; }
function pose(name) {
  const next = `sprite pose-${name}`;
  if ($('sprite').className !== next) $('sprite').className = next;
}
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
  layoutWorld();
  $('runner').classList.add('running');
  $('scene').classList.add('entering');
  startTime = performance.now();
  requestAnimationFrame(run);
});

function run(now) {
  if (jumping || hit) return;
  const progress = Math.min((now - startTime) / 2000, 1);
  const travel = progress < 0.8 ? progress / 0.9 : 1 - Math.pow((1 - progress) / 0.2, 2) / 9;
  // Use complete source frames, including the feet-together contact pose.
  // Keeping the whole silhouette avoids gaps between animated body parts.
  const elapsed = now - startTime;
  const step = Math.floor(elapsed / 110) % 4;
  pose(['run-three', 'land', 'run-one', 'land'][step]);
  const stride = elapsed / 440 * Math.PI * 2;
  move(12 + (targetX() - 12) * travel, Math.abs(Math.sin(stride)) * 3);
  // An early tap is buffered until the last part of the approach.
  if (queuedJump && progress >= 0.72) { jump(); return; }
  if (progress < 1) requestAnimationFrame(run);
  else {
    $('runner').classList.remove('running');
    move(targetX());
    pose('land');
    $('hint').textContent = 'Il regalo è lì. Premi JUMP!';
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
  const runner = $('runner');
  const ground = parseFloat(getComputedStyle(runner).bottom);
  const height = Math.max(0, Math.min(blockBottom - ground - runner.offsetHeight + 9, $('world').clientHeight - ground - runner.offsetHeight - 16));
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
  }, 850);
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
  layoutWorld();
  if (started && !jumping && !hit && performance.now() - startTime >= 2000) move(targetX());
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (started && !hit && !muted) music.play().catch(() => {});
});

new ResizeObserver(layoutWorld).observe($('world'));
$('close-complete').addEventListener('click', () => $('complete').close());

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
    status.textContent = '';
    $('complete').showModal();
  } catch {
    status.textContent = 'Qualcosa non ha funzionato. Riprova.';
  } finally {
    submitting = false;
    $('submit').disabled = false;
    event.target.removeAttribute('aria-busy');
  }
});
