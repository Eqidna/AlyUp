// audio.js
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
            ballSelect: new Audio('assets/ball_select.wav')
        };

        // Mute state
        this.isMuted = false;

        // Store the current BGM for level
        this.currentBgm = null;
    }

    // Play menu background music
    playMenuBgm() {
        if (this.isMuted) return;
        this.stopAllBgm();
        this.menuBgm.play().catch(e => console.error('Menu BGM error:', e));
        this.currentBgm = this.menuBgm;
    }

    // Play level background music based on level number
    playLevelBgm(level) {
        if (this.isMuted) return;
        this.stopAllBgm();
        const bgmIndex = (level - 1) % 10; // Cycle through 10 BGM tracks
        const bgm = this.bgms[bgmIndex];
        bgm.play().catch(e => console.error(`Level ${level} BGM error:`, e));
        this.currentBgm = bgm;
    }

    // Stop all background music
    stopAllBgm() {
        this.menuBgm.pause();
        this.menuBgm.currentTime = 0;
        this.bgms.forEach(bgm => {
            bgm.pause();
            bgm.currentTime = 0;
        });
    }

    // Play ball selection sound
    playBallSound(ballIndex) {
        if (this.isMuted) return;
        const ballKey = `ball${ballIndex + 1}`;
        const sound = this.ballSounds[ballKey];
        sound.currentTime = 0; // Reset to start
        sound.play().catch(e => console.error(`Ball ${ballIndex + 1} sound error:`, e));
    }

    // Play sound effect by key
    playSfx(sfxKey) {
        if (this.isMuted) return;
        const sound = this.sfx[sfxKey];
        sound.currentTime = 0; // Reset to start
        sound.play().catch(e => console.error(`${sfxKey} sound error:`, e));
    }

    // Toggle mute state
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAllBgm();
        } else if (this.currentBgm) {
            this.currentBgm.play().catch(e => console.error('Resume BGM error:', e));
        }
    }
}