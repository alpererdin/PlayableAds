export class shuffleController {
    constructor() {
        this.shuffleButton = document.getElementById('shuffle-symbol');
        this.letters = Array.from(document.querySelectorAll('.letter'));
        this.init();
    }
    init() {
        this.shuffleButton.addEventListener('mousedown', this.shuffleLetters.bind(this));
    }
    shuffleLetters() {
        if (this.shuffleButton.classList.contains('animated')) return;
        this.shuffleButton.classList.remove('enabled');
        this.shuffleButton.classList.add('animated');
        this.shuffleButton.classList.add('disabled');
        this.letters.forEach(letter => letter.classList.add('animated'));
        const positions = [
            { top: '10%', left: '45%' },
            { top: '36%', left: '70%' },
            { top: '62%', left: '45%' },
            { top: '36%', left: '19%' }
        ];
        const shuffledPositions = this.shuffleArray(positions);
        this.letters.forEach((letter, index) => {
            const { top, left } = shuffledPositions[index];
            letter.style.top = top;
            letter.style.left = left;
        });
        setTimeout(() => {
            this.shuffleButton.classList.remove('disabled');
            this.shuffleButton.classList.remove('animated');
            this.letters.forEach(letter => letter.classList.remove('animated'));
        }, 500);
    }
    shuffleArray(array) {
        let shuffledArray;
        let isSame;
        do {
            shuffledArray = [...array];  
            for (let i = shuffledArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
            }
            isSame = this.arraysAreEqual(array, shuffledArray);
        } while (isSame);
        return shuffledArray;
    }
    arraysAreEqual(arr1, arr2) {
        return arr1.every((value, index) => value === arr2[index]);
    }
    cleanup() {
    
        this.shuffleButton.removeEventListener('mousedown', this.shuffleLetters.bind(this));
    }
}
