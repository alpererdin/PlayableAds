export class lineController {
    constructor(levelController) {
        this.levelController = levelController;
        this.blocker = document.getElementById('blocker-container');
        this.container = this.createContainer('drawing-container');
        this.outputElement = this.createOutputElement('text-output');
        this.shuffleImg = document.querySelector('.shuffle-symbol img');
        this.lines = this.createDrawingLines(4);
        this.currentLineIndex = 0;
        this.letters = document.querySelectorAll('.letter');
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentLetter = null;
        this.lastLetter = null;
        this.visitedLetters = new Set();
        this.lineCount = 0;
        this.selectedLetters = []; 
        this.init();
    }

/* inits     ---------------------------------------------*/
    createContainer(id) {
        let container = document.getElementById(id);
        if (!container) {
            container = document.createElement('div');
            container.id = id;
            container.style.position = 'absolute';
            container.style.zIndex = '1';
            document.body.appendChild(container);
        }
        return container;
    }
    createOutputElement(id) {
        let outputElement = document.getElementById(id);
        if (!outputElement) {
            outputElement = document.createElement('div');
            outputElement.id = id;
            document.body.appendChild(outputElement);
        }
        return outputElement;
    }
    createDrawingLines(count) {
        const lines = [];
        for (let i = 0; i < count; i++) {
            const line = document.createElement('div');
            line.className = 'drawing-line';
            Object.assign(line.style, {
                position: 'fixed',
                height: '5px',
                backgroundColor: 'rgb(241, 136, 0)',
                transformOrigin: 'left center',
                zIndex: '5555'
            });
            this.container.appendChild(line);
            lines.push(line);
        }
        return lines;
    }
  
    init() {
        this.letters.forEach(letter => {
            letter.addEventListener('mousedown', (e) => this.handleLetterMouseDown(e, letter));
            letter.addEventListener('mouseover', (e) => this.handleLetterMouseOver(e, letter));
        });
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this)); 
    }
    getCurrentLine() {
        return this.lines[this.currentLineIndex];
    }
    getLetterBottomCenter(letter) {
        const rect = letter.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect(); 
        return {
            x: rect.left + rect.width / 2 - containerRect.left, 
            y: rect.bottom - rect.height / 2 - containerRect.top 
        };
    }

    /* line logic  ---------------------------------------------------*/

    drawLineBetweenPoints(startX, startY, endX, endY, line) {
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX);

        Object.assign(line.style, {
            left: `${startX + this.container.getBoundingClientRect().left}px`,
            top: `${startY + this.container.getBoundingClientRect().top - 2.5}px`,
            width: `${length}px`,
            transform: `rotate(${angle}rad)`
        });
    }
    handleLetterMouseDown(e, letter) {
 
        this.shuffleImg.parentElement.classList.add('disabled');

        if (this.visitedLetters.has(letter)) return;       
        this.isDrawing = true;
        this.currentLetter = letter;
        this.lastLetter = letter;
        this.visitedLetters.add(letter);      
        this.selectedLetters.push(letter.textContent);
        this.updateOutputText(); 
        const bottomCenter = this.getLetterBottomCenter(letter);
        this.startX = bottomCenter.x;
        this.startY = bottomCenter.y;       
        letter.classList.add('visited');      
        e.stopPropagation();
    }
    handleLetterMouseOver(e, letter) {
        if (!this.isDrawing || !this.currentLetter) return;
        if (letter === this.currentLetter) return;
        if (this.lineCount >= 3 && !this.visitedLetters.has(letter)) {
            return;
        }
        if (this.visitedLetters.has(letter)) {
            const letterIndex = this.selectedLetters.indexOf(letter.textContent);
            if (letterIndex === this.selectedLetters.length - 2) {

                const currentLine = this.getCurrentLine();
                currentLine.style.width = '0';
                const lastLetter = this.currentLetter;
                this.visitedLetters.delete(lastLetter);
                lastLetter.classList.remove('visited');
                lastLetter.classList.remove('show-circle');
                lastLetter.classList.add('hide-circle');
                lastLetter.classList.remove('disabled');
                lastLetter.classList.add('enabled');
                this.selectedLetters.pop();
                this.updateOutputText();
                this.lineCount--;
                this.currentLineIndex = (this.currentLineIndex - 1 + 3) % 3;
                this.currentLetter = letter;
                return;
            }
            return;
        }
        const currentBottomCenter = this.getLetterBottomCenter(letter);
        const lastBottomCenter = this.getLetterBottomCenter(this.currentLetter);
        const currentLine = this.getCurrentLine();
        this.drawLineBetweenPoints(
            lastBottomCenter.x,
            lastBottomCenter.y,
            currentBottomCenter.x,
            currentBottomCenter.y,
            currentLine
        );
        letter.classList.add('visited');
        this.visitedLetters.add(letter);
        this.selectedLetters.push(letter.textContent);
        this.updateOutputText();
        this.lastLetter = this.currentLetter;
        this.currentLetter = letter;
        this.currentLineIndex = (this.currentLineIndex + 1) % 4;
        this.lineCount++; 
    }
    handleMouseMove(e) {
        this.outputElement.classList.remove('disabled'); /*output element fixed*/
   
        if (!this.isDrawing || !this.currentLetter || this.lineCount >= 3) return;
        const currentBottomCenter = this.getLetterBottomCenter(this.currentLetter);
        const currentLine = this.getCurrentLine();
        this.drawLineBetweenPoints(
            currentBottomCenter.x,
            currentBottomCenter.y,
            e.clientX - this.container.getBoundingClientRect().left,  
            e.clientY - this.container.getBoundingClientRect().top, 
            currentLine
        );
    }
    handleMouseUp() {
      
        this.shuffleImg.parentElement.classList.remove('disabled');
        if(this.isDrawing)
        {
            this.blocker.classList.remove('disabled');
            this.blocker.classList.add('enabled');
        }
        this.isDrawing = false; 
        this.currentLineIndex = 0;
        this.currentLetter = null;
        this.lastLetter = null;
        this.resetAllLines();
        this.resetAllLetters(); 
        
        const text = this.outputElement.textContent;
        const isWordRepeat = this.levelController.checkWordRepeat(text);
        const isWordCorrect = this.levelController.checkWordMatch(text);

        if (isWordRepeat) {
            this.outputElement.classList.add('shake');
            setTimeout(() => {   
                this.outputElement.classList.remove('shake');
                this.resetText();
                this.blocker.classList.remove('enabled');
                this.blocker.classList.add('disabled');
                    
            }, 300);
        } 
        else if (isWordCorrect) {
            this.blocker.classList.remove('disabled');
            this.blocker.classList.add('enabled');
            if (!this.correctWords) {
                this.correctWords = [];
            }
            this.levelController.positionSetter(text);
            this.removeLetters();
            setTimeout(() => {     
               
                this.blocker.classList.remove('enabled');
                this.blocker.classList.add('disabled'); 
            }, 700); 
        } else {
            this.outputElement.classList.add('shake');
            setTimeout(() => {   
                this.outputElement.classList.remove('shake');
                this.resetText();
                this.blocker.classList.remove('enabled');
                this.blocker.classList.add('disabled');
            }, 350); 
        }
    }
    removeLetters() {
        const text = this.outputElement.textContent; 
        let index = 0; 
        const interval = setInterval(() => {
            if (index <= text.length) { 
                const updatedText = text.slice(index); 
                this.outputElement.textContent = updatedText; 
                index++; 
            } else {
                clearInterval(interval); 
            }
        }, 100);
    }
    /*resets --------------------------------------------------------*/
    updateOutputText() {
        this.outputElement.textContent = this.selectedLetters.join('');
    
    }
    resetText()
    {
        this.updateOutputText();
        this.blocker.classList.remove('enabled');
        this.blocker.classList.add('disabled');
    }
    resetAllLines() {
        this.lines.forEach(line => line.style.width = '0');
        this.lineCount = 0;
    }
    resetAllLetters() {
        this.letters.forEach(letter => {
            letter.classList.remove('visited');
        });
        this.visitedLetters.clear();
        this.selectedLetters = [];
    }
  
    cleanup() {
        this.letters.forEach(letter => {
            letter.removeEventListener('mousedown', this.handleLetterMouseDown);
            letter.removeEventListener('mouseover', this.handleLetterMouseOver);
        });
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.body.removeChild(this.container);
        if (this.outputElement) {
            document.body.removeChild(this.outputElement);
        }
    }
}
