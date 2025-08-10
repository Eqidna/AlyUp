export class AudioManager {
    constructor() {
        // Initialize background music
        this.menuBgm = new Audio('assets/Music/menu_bgm_1.mp3');
        this.menuBgm.loop = true;
        this.bgms = [];
        for (let i = 1; i <= 10; i++) {
            const bgm = new Audio(`assets/Music/bgm_${i}.mp3`);
            bgm.loop = true;
            this.bgms.push(bgm);
        }

        // Initialize sound effects
        this.ballSounds = {
            ball1: new Audio('assets/ball1_sound.wav'),
            ball2: new Audio('assets/ball2_sound.wav'),
            ball3: new Audio('assets/ball3_sound.wav'),
            ball4: new Audio('assets/ball4_sound.wav'),
            ball5: new Audio('assets/ball5_sound.wav')
        };
        this.sfx = {
            gloveFly: new Audio('assets/glove_fly.wav'),
            jumpSprite: new Audio('assets/jump_sprite.wav'),
            gloveCollect: new Audio('assets/glove_collect.wav'),
            boost: new Audio('assets/boost.wav'),
            platformBounce: new Audio('assets/platform_bounce.wav'),
            levelComplete: new Audio('assets/level_complete.wav'),
            levelSelect: new Audio('assets/level_select.wav'),
            ballSelect: new Audio('assets/ball_select.wav'),
            airDash: new Audio('assets/airDash.mp3'),
            airDashReady: new Audio('assets/airDashReady.mp3')
        };

        // Volume and mute states from localStorage
        this.musicVolume = parseFloat(localStorage.getItem('musicVolume') || '0.35');
        this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume') || '1.0');
        this.isMusicMuted = localStorage.getItem('isMusicMuted') === 'true' || false;
        this.isSfxMuted = localStorage.getItem('isSfxMuted') === 'true' || false;

        // Store the current BGM for level
        this.currentBgm = null;

        // Apply initial volumes
        this.updateMusicVolume();
        this.updateSfxVolume();
    }

    updateMusicVolume() {
        this.menuBgm.volume = this.isMusicMuted ? 0 : this.musicVolume;
        this.bgms.forEach(bgm => bgm.volume = this.isMusicMuted ? 0 : this.musicVolume);
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('isMusicMuted', this.isMusicMuted);
    }

    updateSfxVolume() {
        Object.values(this.ballSounds).forEach(sound => sound.volume = this.isSfxMuted ? 0 : this.sfxVolume);
        Object.values(this.sfx).forEach(sound => sound.volume = this.isSfxMuted ? 0 : this.sfxVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        localStorage.setItem('isSfxMuted', this.isSfxMuted);
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.updateMusicVolume();
    }

    setSfxVolume(volume) {
        this.sfxVolume = volume;
        this.updateSfxVolume();
    }

    playMenuBgm() {
        if (this.isMusicMuted) return;
        this.stopAllBgm();
        this.menuBgm.play().catch(e => console.error('Menu BGM error:', e));
        this.currentBgm = this.menuBgm;
    }

    playLevelBgm(level) {
        if (this.isMusicMuted) return;
        this.stopAllBgm();
        const bgmIndex = (level - 1) % 10;
        const bgm = this.bgms[bgmIndex];
        bgm.play().catch(e => console.error(`Level ${level} BGM error:`, e));
        this.currentBgm = bgm;
    }

    stopAllBgm() {
        this.menuBgm.pause();
        this.menuBgm.currentTime = 0;
        this.bgms.forEach(bgm => {
            bgm.pause();
            bgm.currentTime = 0;
        });
    }

    playBallSound(ballIndex) {
        if (this.isSfxMuted) return;
        const ballKey = `ball${ballIndex + 1}`;
        const sound = this.ballSounds[ballKey];
        sound.currentTime = 0;
        sound.play().catch(e => console.error(`Ball ${ballIndex + 1} sound error:`, e));
    }

    playSfx(sfxKey) {
        if (this.isSfxMuted) return;
        const sound = this.sfx[sfxKey];
        sound.currentTime = 0;
        sound.play().catch(e => console.error(`${sfxKey} sound error:`, e));
    }

     playSfx(airDash) {
        if (!this.isSfxMuted) {
            this.sfx[airDash].currentTime = 0;
            this.sfx[airDash].volume = this.sfxVolume;
            this.sfx[airDash].play();
        }
    }

    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        this.updateMusicVolume();
        if (this.isMusicMuted) {
            this.stopAllBgm();
        } else if (this.currentBgm) {
            this.currentBgm.play().catch(e => console.error('Resume BGM error:', e));
        }
    }

    toggleSfxMute() {
        this.isSfxMuted = !this.isSfxMuted;
        this.updateSfxVolume();
    }
}