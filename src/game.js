import gsap, { Power0 } from "gsap";
import { Container, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";

import { lineController } from './lineController';
import { letterController } from './letterController';
import { shuffleController } from './shuffleController';
import {levelController } from './levelController';
export default class Game extends Container {

  constructor() {
    super();
    this.init();
  }
  init() {
 
    let sprite = Sprite.from("logo");
    sprite.anchor.set(0.5);
    sprite.scale.set(0.5);
    this.addChild(sprite);
    sprite.x = GAME_WIDTH * 0.5;
    sprite.y = GAME_HEIGHT * 0.5;

    gsap.to(sprite, {
      pixi: {
        scale: 0.6,
      },
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut",
    })
 
    this.letterController = new letterController();
    this.levelController = new levelController(this.letterController);
    this.lineController = new lineController(this.levelController);
    this.shuffleController = new shuffleController();
    const letterContainer = new Container();  
    this.addChild(letterContainer); 

  };

  resize(width, height) {
    this.letterController.resize(width, height);
    this.lineController.resize(width, height);
    this.shuffleController.resize(width, height);
    this.levelController.resize(width,height);
  }

  cleanup() {
    this.letterController?.cleanup();
    this.lineController?.cleanup();
    this.shuffleController?.cleanup();
    this.levelController.cleanup()  
    this.removeChildren();
  }
}
