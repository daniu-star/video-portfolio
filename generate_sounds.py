import numpy as np
import wave
import struct
import os

SAMPLE_RATE = 44100
SOUNDS_DIR = r'd:\作品集\sounds'

def write_wav(filename, samples):
    filepath = os.path.join(SOUNDS_DIR, filename)
    samples = np.clip(samples, -1.0, 1.0)
    pcm_data = (samples * 32767).astype(np.int16)
    with wave.open(filepath, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(pcm_data.tobytes())
    size = os.path.getsize(filepath)
    print(f"  Written: {filename} ({size:,} bytes)")

def generate_bell_sound(base_freq, duration, overtones, decay_rates,
                         attack_time=0.005, noise_dur=0.02, noise_amp=0.15,
                         reverb_dur=0.3, reverb_decay=8.0, amplitude=0.8):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    signal = np.zeros_like(t)

    for i, (freq_ratio, amp_ratio) in enumerate(overtones):
        freq = base_freq * freq_ratio
        if freq > SAMPLE_RATE / 2:
            continue
        decay = decay_rates[i] if i < len(decay_rates) else decay_rates[-1]
        env = np.exp(-decay * t)
        phase_offset = np.random.uniform(0, 2 * np.pi)
        beating = 1.0 + 0.002 * np.sin(2 * np.pi * 0.5 * t + phase_offset)
        signal += amp_ratio * env * beating * np.sin(2 * np.pi * freq * t + phase_offset)

    attack_env = np.ones_like(t)
    attack_samples = int(attack_time * SAMPLE_RATE)
    if attack_samples > 0 and attack_samples < len(t):
        attack_env[:attack_samples] = np.linspace(0, 1, attack_samples) ** 2

    noise_samples = int(noise_dur * SAMPLE_RATE)
    if noise_samples > 0:
        noise = np.random.randn(min(noise_samples, len(t))) * noise_amp
        noise_env = np.exp(-30 * np.linspace(0, noise_dur, len(noise)))
        signal[:len(noise)] += noise * noise_env

    signal *= attack_env

    if reverb_dur > 0:
        reverb_len = int(reverb_dur * SAMPLE_RATE)
        if reverb_len > 0:
            reverb_t = np.linspace(0, reverb_dur, reverb_len)
            reverb_env = np.exp(-reverb_decay * reverb_t)
            delays = [0.012, 0.027, 0.041, 0.058, 0.073]
            gains = [0.3, 0.25, 0.2, 0.15, 0.1]
            for d, g in zip(delays, gains):
                delay_idx = int(d * SAMPLE_RATE)
                if delay_idx < len(signal):
                    padded = np.zeros(len(signal) + reverb_len)
                    padded[:len(signal)] = signal
                    reverb_signal = np.zeros_like(padded)
                    reverb_signal[delay_idx:delay_idx + reverb_len] = g * signal[:reverb_len] * reverb_env
                    signal = padded[:len(signal)] + reverb_signal[:len(signal)]

    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak * amplitude

    return signal

def generate_drum_sound(base_freq, duration, attack_freq, pitch_drop_time,
                         overtones, decay_rates, noise_amp=0.5, noise_decay=25.0,
                         body_decay=6.0, amplitude=0.8):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    signal = np.zeros_like(t)

    pitch_env = attack_freq + (base_freq - attack_freq) * (1 - np.exp(-pitch_drop_time * t))
    phase = np.cumsum(2 * np.pi * pitch_env / SAMPLE_RATE)
    body_env = np.exp(-body_decay * t)
    signal += body_env * np.sin(phase)

    for i, (freq_ratio, amp_ratio) in enumerate(overtones):
        freq = base_freq * freq_ratio
        if freq > SAMPLE_RATE / 2:
            continue
        decay = decay_rates[i] if i < len(decay_rates) else decay_rates[-1]
        env = np.exp(-decay * t)
        signal += amp_ratio * env * np.sin(2 * np.pi * freq * t)

    noise = np.random.randn(len(t))
    noise_env = np.exp(-noise_decay * t)
    signal += noise_amp * noise * noise_env

    attack_samples = int(0.001 * SAMPLE_RATE)
    if attack_samples > 0 and attack_samples < len(t):
        signal[:attack_samples] *= np.linspace(1.5, 1.0, attack_samples)

    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak * amplitude

    return signal

def generate_documentary_bell():
    print("[1/4] Generating documentary bell (temple big bell)...")
    overtones = [
        (0.5, 0.3),
        (1.0, 1.0),
        (1.189, 0.65),
        (1.498, 0.45),
        (2.0, 0.35),
        (2.52, 0.2),
        (2.997, 0.15),
        (3.48, 0.1),
        (4.0, 0.08),
        (4.5, 0.05),
        (5.04, 0.03),
    ]
    decay_rates = [1.5, 1.2, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]
    signal = generate_bell_sound(
        base_freq=120,
        duration=2.0,
        overtones=overtones,
        decay_rates=decay_rates,
        attack_time=0.008,
        noise_dur=0.03,
        noise_amp=0.2,
        reverb_dur=0.5,
        reverb_decay=6.0,
        amplitude=0.85
    )
    write_wav('click-documentary.wav', signal)

def generate_ads_chime():
    print("[2/4] Generating ads chime (bronze qing / bianzhong)...")
    overtones = [
        (1.0, 1.0),
        (2.76, 0.55),
        (3.95, 0.35),
        (5.12, 0.2),
        (6.35, 0.12),
        (7.58, 0.08),
        (8.8, 0.05),
    ]
    decay_rates = [2.0, 3.5, 5.0, 6.0, 7.0, 8.0, 9.0]
    signal = generate_bell_sound(
        base_freq=880,
        duration=1.5,
        overtones=overtones,
        decay_rates=decay_rates,
        attack_time=0.002,
        noise_dur=0.01,
        noise_amp=0.1,
        reverb_dur=0.3,
        reverb_decay=10.0,
        amplitude=0.75
    )
    write_wav('click-ads.wav', signal)

def generate_game_drum():
    print("[3/4] Generating game drum (taiko / war drum)...")
    overtones = [
        (1.5, 0.4),
        (2.0, 0.25),
        (2.5, 0.15),
        (3.0, 0.1),
        (3.5, 0.05),
    ]
    decay_rates = [8.0, 12.0, 15.0, 18.0, 20.0]
    signal = generate_drum_sound(
        base_freq=65,
        duration=1.5,
        attack_freq=200,
        pitch_drop_time=80.0,
        overtones=overtones,
        decay_rates=decay_rates,
        noise_amp=0.6,
        noise_decay=20.0,
        body_decay=4.0,
        amplitude=0.9
    )
    t = np.linspace(0, 1.5, int(SAMPLE_RATE * 1.5), endpoint=False)
    shell_resonance = 0.08 * np.exp(-8.0 * t) * np.sin(2 * np.pi * 180 * t)
    signal += shell_resonance
    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak * 0.9
    write_wav('click-game.wav', signal)

def generate_real_meditation():
    print("[4/4] Generating real documentary echo sound...")
    duration = 3.0
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)

    signal = np.zeros_like(t)

    base_freq = 150
    signal += 1.0 * np.exp(-1.2 * t) * np.sin(2 * np.pi * base_freq * t)
    signal += 0.5 * np.exp(-1.8 * t) * np.sin(2 * np.pi * base_freq * 1.498 * t)
    signal += 0.35 * np.exp(-2.2 * t) * np.sin(2 * np.pi * base_freq * 2.0 * t)
    signal += 0.2 * np.exp(-2.8 * t) * np.sin(2 * np.pi * base_freq * 2.52 * t)
    signal += 0.12 * np.exp(-3.5 * t) * np.sin(2 * np.pi * base_freq * 3.0 * t)
    signal += 0.08 * np.exp(-4.0 * t) * np.sin(2 * np.pi * base_freq * 3.48 * t)

    attack_samples = int(0.005 * SAMPLE_RATE)
    if attack_samples > 0 and attack_samples < len(t):
        attack_env = np.ones_like(t)
        attack_env[:attack_samples] = np.linspace(0, 1, attack_samples) ** 2
        signal *= attack_env

    noise_samples = int(0.015 * SAMPLE_RATE)
    if noise_samples > 0:
        noise = np.random.randn(min(noise_samples, len(t))) * 0.12
        noise_env = np.exp(-40 * np.linspace(0, 0.015, len(noise)))
        signal[:len(noise)] += noise * noise_env

    echo_delays = [0.08, 0.18, 0.30, 0.44, 0.60, 0.80, 1.05]
    echo_gains = [0.55, 0.42, 0.32, 0.24, 0.17, 0.12, 0.08]
    echo_decay_rates = [1.0, 1.3, 1.6, 2.0, 2.4, 2.8, 3.2]

    total_len = len(signal)
    extended = np.zeros(total_len + int(1.5 * SAMPLE_RATE))
    extended[:total_len] = signal

    for i, (delay, gain, echo_decay) in enumerate(zip(echo_delays, echo_gains, echo_decay_rates)):
        delay_idx = int(delay * SAMPLE_RATE)
        echo_len = min(total_len, len(extended) - delay_idx)
        if delay_idx < len(extended) and echo_len > 0:
            echo_t = np.linspace(0, echo_len / SAMPLE_RATE, echo_len)
            echo_env = gain * np.exp(-echo_decay * echo_t)
            freq_shift = 1.0 - i * 0.005
            echo_signal = echo_env * np.sin(2 * np.pi * base_freq * freq_shift * (delay + echo_t))
            extended[delay_idx:delay_idx + echo_len] += echo_signal[:echo_len]

    reverb_len = int(1.5 * SAMPLE_RATE)
    reverb_t = np.linspace(0, 1.5, reverb_len)
    reverb_delays = [0.012, 0.027, 0.041, 0.058, 0.073, 0.091, 0.112, 0.137]
    reverb_gains = [0.25, 0.22, 0.18, 0.15, 0.12, 0.09, 0.07, 0.05]
    for d, g in zip(reverb_delays, reverb_gains):
        delay_idx = int(d * SAMPLE_RATE)
        if delay_idx < len(extended):
            reverb_env = g * np.exp(-3.0 * reverb_t)
            extended[delay_idx:delay_idx + min(reverb_len, len(extended) - delay_idx)] += \
                reverb_env[:min(reverb_len, len(extended) - delay_idx)] * \
                extended[:min(reverb_len, len(extended) - delay_idx)] * 0.3

    signal = extended[:total_len]

    low_pass_alpha = 0.04
    filtered = np.zeros_like(signal)
    filtered[0] = signal[0]
    for i in range(1, len(signal)):
        filtered[i] = low_pass_alpha * signal[i] + (1 - low_pass_alpha) * filtered[i - 1]
    signal = 0.3 * filtered + 0.7 * signal

    fade_out_samples = int(0.8 * SAMPLE_RATE)
    if fade_out_samples > 0 and fade_out_samples < len(signal):
        fade_start = len(signal) - fade_out_samples
        signal[fade_start:] *= np.linspace(1, 0, fade_out_samples) ** 1.5

    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak * 0.8

    write_wav('click-real.wav', signal)

if __name__ == '__main__':
    os.makedirs(SOUNDS_DIR, exist_ok=True)
    print("=== Generating high-quality Chinese traditional bell/drum sounds ===")
    print(f"Sample rate: {SAMPLE_RATE} Hz, Format: 16-bit PCM WAV\n")
    generate_documentary_bell()
    generate_ads_chime()
    generate_game_drum()
    generate_real_meditation()
    print("\n=== All sounds generated successfully ===")
    print("\nFile listing:")
    for f in sorted(os.listdir(SOUNDS_DIR)):
        if f.endswith('.wav'):
            size = os.path.getsize(os.path.join(SOUNDS_DIR, f))
            print(f"  {f}: {size:,} bytes")
