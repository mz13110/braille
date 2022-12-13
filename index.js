const BRAILLE_CHARS = "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿".split("")
const toSingle = (pix) => this.BRAILLE_CHARS[new Array(6).reduce((a,_,i) => pix[i] ? a + (2**i) : a)]

/**
 * @typedef {(x: number, y: number, l: boolean, r: boolean) => {x: number, y: number, c: boolean}[]} BrToolListener
 * @typedef {{down: BrToolListener, move: BrToolListener, up: BrToolListener}} BrTool
 */

class BrCanvasElement extends HTMLCanvasElement {
  /**
   * @var {CanvasRenderingContext2D} #ctx
   * @var {{x: number, y: number}} #mouseState
   * @var {BrTool} tool
   */
  #ctx
  #mouseState = {
    x: 0,
    y: 0
  }
  tool

  constructor() {
    super()
    
    this.classList.add("br-canvas")
    this.#ctx = this.getContext("2d")
    
    function handler(name) {
      return function (e) {
        e.preventDefault()

        if(e.buttons === 0) return

        this.#mouseState.x = e.offsetX
        this.#mouseState.y = e.offsetY

        if(this.tool) {
          let rect = this.getBoundingClientRect()
          let ratioW = this.width / rect.width
          let ratioH = this.height / rect.height
          for(let p of this.tool[name](this.#mouseState.x, this.#mouseState.y, e.buttons & 1, (e.buttons >> 1) & 1)) {
            this.set(p.x*ratioW, p.y*ratioH, p.c)
          }
        }
      }
    }

    this.oncontextmenu = (e) => e.preventDefault()

    this.onmousedown = handler("down")
    this.onmousemove = handler("move")
    this.onmouseup = handler("up")
    this.onmouseleave = handler("up")
  }

  set(x, y, c) {
    this.#ctx.fillStyle = c ? "#000000" : "#ffffff";
    this.#ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}
customElements.define("br-canvas", BrCanvasElement, {extends: "canvas"})



document.querySelector("canvas").tool = {
  down: (x, y, l, r) => l||r ? [{x, y, c:l}] : [],
  move: (x, y, l, r) => l||r ? [{x, y, c:l}] : [],
  up: (x, y, l, r) => l||r ? [{x, y, c:l}] : []
}