export class letterController {
    constructor() {
        this.letters = [];
        this.isMouseDown = false;
        this.activeLetters = new Set();
        this.init();
    }
    init() {
        this.updateLetters(); 
        document.addEventListener('mouseup', () => this.handleGlobalMouseUp());
        document.addEventListener('touchend', () => this.handleGlobalMouseUp());
    }

    updateLetters() {
        const newLetters = document.querySelectorAll('.letter');
        newLetters.forEach(letter => {
            if (!this.letters.includes(letter)) {
                letter.addEventListener('mousedown', (e) => this.handleMouseDown(e, letter));
                letter.addEventListener('mouseover', (e) => this.handleMouseOver(e, letter));
                letter.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleMouseDown(e, letter);
                });
            }
        });
        this.letters = Array.from(newLetters);
    }
    handleMouseDown(e, letter) {
        this.isMouseDown = true;
        this.activeLetters.add(letter);
        letter.classList.remove('hide-circle');
        letter.classList.add('show-circle');
        letter.classList.remove('enabled');
        letter.classList.add('disabled');
    }
    handleMouseOver(e, letter) {
        if (this.isMouseDown) {
            this.activeLetters.add(letter);
            letter.classList.add('show-circle');
            letter.classList.remove('enabled');
            letter.classList.add('disabled');
        }
    }
    handleGlobalMouseUp() {
        this.isMouseDown = false;
        this.activeLetters.forEach(letter => {
            letter.classList.remove('hide-circle');
            letter.classList.remove('show-circle');
        });
        this.activeLetters.forEach(e => {
            e.classList.remove('disabled');
            e.classList.add('enabled');
        });
        this.activeLetters.clear();
    }
    cleanup() {
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
        document.removeEventListener('touchend', this.handleGlobalMouseUp);
        this.letters.forEach(letter => {
            letter.removeEventListener('mousedown', this.handleMouseDown);
            letter.removeEventListener('mouseover', this.handleMouseOver);
            letter.removeEventListener('touchstart', this.handleMouseDown);
        });
    }
    refreshLetters() {
        this.updateLetters();
    }
}
