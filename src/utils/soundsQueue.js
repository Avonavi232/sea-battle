class SoundsQueue{
    constructor() {
        this.queue = [];
        this.currentlyPlayed = null;
        this.volume = 0.5;
    }

    _clearAudioQueue() {
        this.queue.length = 0;
    }

    _playSound = (audio, callback) => {
        audio.volume = this.volume;
        audio.play()
            .catch(e => {
                this._clearAudioQueue();
            });
        if (callback) {
            audio.onended = callback;
        }
    };

    _playSoundQueue = () => {
        const recursive_play = () => {
            if (this.queue.length) {
                this.currentlyPlayed = this.queue.pop();
                this._playSound(this.currentlyPlayed, () => recursive_play());
            } else {
                this.currentlyPlayed = null;
            }
        };

        if (!this.currentlyPlayed) {
            recursive_play();
        }
    };

    _addToQueue = sound => {
        this.queue.unshift(sound);
    };

    play(sound){
        if (!sound) {
            return;
        }
        this._addToQueue(sound);
        this._playSoundQueue();
    }
}

export const soundsQueue = new SoundsQueue();