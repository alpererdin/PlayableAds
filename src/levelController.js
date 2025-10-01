import { levelConfig } from './levelConfig.js';
import { helperTimer } from './helperTimer.js';
export class levelController {
    constructor(letterController) {
        this.letterController = letterController;
        this.levelConfig = levelConfig;
        this.currentWords = [];
        this.correctWords = [];
        this.indexedLetters = new Set();
        this.outputElement = document.getElementById('text-output');
        this.gridContainer = document.getElementById('grid-container');
        this.afterArea = document.getElementById('after_area');
        this.playNowBtn = document.getElementById('play-now');
        this.itemTemplate = document.querySelector('.grid-item');

        this.helperTimer = new helperTimer(this); 
   
        this.indexsize=null;
        this.remainingWords=[];
        
        this.selectedLevel='level1'; 
       //this.selectedLevel='levelTest'; // -> avaible
    
        this.init();
        this.initializeWordIndexes();  
        this.helperTimer.startCountdown();
    } 
     
    showWordSlowly(word, startY, startX, orientation) {
        if (this.helperTimer.isMouseDown) return;  
        
        const letters = word.split('');
        let currentX = startX;
        let currentY = startY;
        
        letters.forEach((letter, index) => {
            
            setTimeout(() => {
                if (!this.helperTimer.isMouseDown) {  
                    this.showTemporaryHighlight(currentY, currentX, letter);
                    orientation === 'h' ? currentX++ : currentY++;
                }
            }, index * 500);
        });

        setTimeout(() => {
            if (this.helperTimer.isMouseDown) {
                this.resetTimer();
            }
        }, letters.length * 500 + 1000);
    }

    showTemporaryHighlight(y, x, letter) {
        const gridItems = Array.from(this.gridContainer.children);
        const item = gridItems.find(
            (child) => Number(child.dataset.y) === y && Number(child.dataset.x) === x
        );
        
        if (item) {
            const originalColor = item.style.backgroundColor;
            const originalContent = item.innerHTML;
            
            item.style.transition = 'background-color 0.3s ease';
            item.style.backgroundColor = '#ffea00';
            
            const textContent = document.createElement('span');
            textContent.textContent = letter;
            textContent.style.color = 'white';
            textContent.style.fontSize = '50px';
            textContent.style.fontFamily = 'Sniglet, sans-serif';
            
            item.innerHTML = '';
            item.appendChild(textContent);
            
            setTimeout(() => {
                if (!this.isInputActive) {
                    item.style.backgroundColor = originalColor;
                    item.innerHTML = originalContent;
                }
            }, 400);
        }
    }
    highlightWord(word, startY, startX, orientation) {
        if (this.helperTimer.isMouseDown) return;
        const letters = word.split('');
        let currentX = startX;
        let currentY = startY;
    
        letters.forEach((letter, index) => {
            setTimeout(() => {
                this.animateGridTransitionByCoordinates(letter,currentY, currentX,index);
                orientation === 'h' ? currentX++ : currentY++;
            }, index * 50);  
        });
    }  
    animateGridTransitionByCoordinates(letter,targetY, targetX,index) {
        const gridItems = Array.from(this.gridContainer.children);
        const item = gridItems.find(
            (child) => Number(child.dataset.y) === targetY && Number(child.dataset.x) === targetX
        );
        if (!item) {
            console.error(`errrorr (${targetY}, ${targetX})`);
            return;
        }
        /*start point  */
        const outputRect = this.outputElement.getBoundingClientRect();
        const textContent = document.createElement('span');
        textContent.textContent = letter;
        textContent.style.position = 'absolute';
        const offsetX = index * 30;
        textContent.style.left = `${outputRect.left + offsetX}px`;
        textContent.style.top = `${outputRect.top}px`;
        textContent.style.opacity = 1;
        textContent.style.color = 'white'; 
        textContent.style.fontSize = '40px'; 
        textContent.style.fontFamily = 'Sniglet, sans-serif';
        document.body.appendChild(textContent);
  
        setTimeout(() => {
            const gridRect = item.getBoundingClientRect();
            const textWidth = textContent.offsetWidth;
            const textHeight = textContent.offsetHeight;
            textContent.style.position = 'absolute';
            
            const centerX = gridRect.left + (gridRect.width - textWidth) / 2;
            const centerY = gridRect.top + (gridRect.height - textHeight) / 2;
            textContent.style.fontSize = '50px';
            textContent.style.transition = 
            'left 0.5s cubic-bezier(0.5, 0, 1, 1), top 0.5s cubic-bezier(0.5, 0, 1, 1), opacity 0.5s cubic-bezier(0.5, 0, 1, 1)';

            textContent.style.left = `${centerX-3}px`;
            textContent.style.top = `${centerY-10}px`;
   

            setTimeout(() => {
             
                if (item.childElementCount > 0) {
                    textContent.style.opacity = 0;
                    item.style.transition = 'background-color 0.5s ease';
                    item.style.backgroundColor = '#ffea00';
                    setTimeout(() => {
                        item.style.backgroundColor = '#ff8000';    
                    }, 250);
                    return;
                }
                textContent.style.position = 'static'; 
                item.style.opacity = 1;
                item.style.transition = 'background-color 0.5s ease';
                item.style.backgroundColor = '#ffea00';
                setTimeout(() => {
                    item.style.backgroundColor = '#ff8000';    
                }, 250);
                item.appendChild(textContent);
     
            }, 500);  


        }, 100); 
    }

    gridInstantiate() { 
        while (this.gridContainer.firstChild) {
            this.gridContainer.removeChild(this.gridContainer.firstChild);
        }
        this.indexedLetters.forEach(({ coordinates },) => {
            const newItem = this.itemTemplate.cloneNode();  

            newItem.style.gridRowStart = coordinates.y + 1;
            newItem.style.gridColumnStart = coordinates.x + 1;
            newItem.dataset.y = coordinates.y;
            newItem.dataset.x = coordinates.x;
 
            this.gridContainer.appendChild(newItem);  
        }); 
        
    }
    checkWordRepeat(word) {
        return this.correctWords.includes(word);  
    }
    getRemainingWords() {
        this.remainingWords = this.currentWords.filter(word => !this.correctWords.includes(word));
        return this.remainingWords;
    }
    checkWordMatch(word) {
        const wordIndex = this.currentWords.indexOf(word);
        if (wordIndex !== -1) {
            if (!this.correctWords.includes(word)) {
                this.correctWords.push(word);
                const wordData = this.findWordData(word);
                if (wordData) {
                    const { startY, startX, orientation } = this.parseWordData(wordData);
                    this.highlightWord(word, startY, startX, orientation);
                    if(this.getRemainingWords().length==0)
                    {
                        setTimeout(() => {
                            this.afterArea.classList.add('enabled');
                            this.playNowBtn.classList.add('mover');
                             
                        }, 850);
                    }
                 }
                return true;
            }
        }
        return false;
    }

    initializeWordIndexes() { 
        const realDataEntries = this.getRealDataEntries();     
        realDataEntries.forEach(data => { 
          
            const { startY, startX, orientation } = this.parseWordData(data);
          
            this.AllprocessWordInfo(data, startY, startX, orientation); 
        });
       
        this.gridInstantiate();
    }    
    AllprocessWordInfo(word, startY, startX, orientation) { 
        
        const letters = word.split(',')[2].split('');
        let currentX = startX;
        let currentY = startY;  
        
        letters.forEach(letter => {     
           
            const coordinates = { y: currentY, x: currentX }; 
            if (!this.isIndexedLetter(coordinates, letter)) {
                this.indexedLetters.add({ letter, coordinates });
              
            }
            orientation === 'h' ? currentX++ : currentY++; 
          
            this.indexsize=this.indexedLetters.size;
        }); 
      
    }
   
    
    isIndexedLetter(coordinates, letter) {
     
        return [...this.indexedLetters].some(item => 
            item.letter === letter && 
            item.coordinates.x === coordinates.x && 
            item.coordinates.y === coordinates.y
        );
    }
    
    parseWordData(data) {
        const parts = data.split(','); 
        const startY = parseInt(parts[0]); 
        const startX = parseInt(parts[1]); 
        const orientation = parts[3] === 'H' ? 'h' : 'v';
       
        return { startY, startX, orientation };
       
    }  
    
    positionSetter(word) {
        const wordData = this.findWordData(word);
       
        if (wordData) {
            const { startY, startX, orientation } = this.parseWordData(wordData);
            
            this.processWordInfo(word, startY, startX, orientation);
     
        }
    }
    /* %100  */
    findWordData(word) {
        const realDataEntries = this.getRealDataEntries();
        return realDataEntries.find(data => {
            const parts = data.split(',');
            const wordInData = parts[2];  
            return wordInData === word;  
        });
    }
    
    processWordInfo(word, startY, startX, orientation) {
        const letters = word.split(''); 
    
        letters.forEach((letter, index) => {    
            orientation === 'h' ? startX++ : startY++;
        });
    }

    getRealDataEntries() {
        return levelConfig[this.selectedLevel].realData.split('|');
    } 

/*circle letters */
    init() {
        const currentLevel =this.selectedLevel;
        const letters = this.levelConfig[currentLevel].lvl1Letters.split(',');
        const words = this.levelConfig[currentLevel].lvl1Words.split(',');
        this.currentWords = words; 
        const shuffledLetters = this.shuffleArray(letters);
        this.updateLetters(
            shuffledLetters[0],
            shuffledLetters[1],
            shuffledLetters[2],
            shuffledLetters[3]
        );
        this.letterController.refreshLetters();
    }
    updateLetters(letter1, letter2, letter3, letter4) {
        document.getElementById('letter1').textContent = letter1;
        document.getElementById('letter2').textContent = letter2;
        document.getElementById('letter3').textContent = letter3;
        document.getElementById('letter4').textContent = letter4;
    }
    /*unique start */
    shuffleArray(array) {
        let shuffledArray = array.slice();  
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }
}