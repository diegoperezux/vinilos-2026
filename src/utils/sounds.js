/**
 * Plays a short vinyl-sleeve friction sound using the Web Audio API.
 * Synthesized noise shaped into a soft "swoosh" — no audio files needed.
 */
export function playVinylOpen() {
  try {
    const ctx = new AudioContext();

    const DURATION = 0.18; // seconds

    // White noise buffer
    const bufferSize = Math.ceil(ctx.sampleRate * DURATION);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter shapes noise into a papery friction tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    // Envelope: quick attack, smooth decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + DURATION);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + DURATION);

    // Clean up after playback
    noise.onended = () => ctx.close();
  } catch {
    // Silently fail if AudioContext is unavailable
  }
}
