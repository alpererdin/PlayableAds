export class helperTimer {
    constructor(levelController) {
        this.levelController = levelController;
        this.isMouseDown = false;
        this.startTimer = 3;
        this.timer = this.startTimer;
        this.countdownInterval = null;

        this.init();
    }

    init() {
        document.addEventListener('pointerdown', () => {
            this.isMouseDown = true;
            this.stopTimer();
           
        });

        document.addEventListener('pointerup', () => {
            this.isMouseDown = false;
            this.resetTimer();
        });
    }

    startCountdown() {
        if (this.countdownInterval) return;
        this.countdownInterval = setInterval(() => {
            if (!this.isMouseDown && this.timer > 0) {
                this.timer -= 0.5;
                console.log(this.timer);
                if (this.timer <= 0) {
                    clearInterval(this.countdownInterval);
                    this.showHelper();
                }
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.timer = this.startTimer;
    }

    resetTimer() {
        this.timer = this.startTimer;
        this.startCountdown();
    }

    showHelper() {
        if (this.isMouseDown) return;

        const remainingWords = this.levelController.currentWords.filter(word => !this.levelController.correctWords.includes(word));
        if (remainingWords.length === 0) return;

        const wordToShow = remainingWords[0];
        const wordData = this.levelController.findWordData(wordToShow);

        if (wordData) {
            const { startY, startX, orientation } = this.levelController.parseWordData(wordData);
            this.levelController.showWordSlowly(wordToShow, startY, startX, orientation);
        }
    }
}
