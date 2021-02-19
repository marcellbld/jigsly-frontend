import { Texture } from "pixi.js";
import { Puzzle } from "../../shared/models/puzzle";
import { PuzzlePiece } from "../../shared/models/puzzle-piece";
import * as PIXI from 'pixi.js';
import { PieceAttachType } from "../../shared/enum/attach-type.enum";
import { GameRoomComponent } from "../game-room.component";
import { BevelFilter } from "@pixi/filter-bevel";

export class PuzzlePieceSprite extends PIXI.Container {

    public static readonly COLOR_OUTLINE_BASE = 0xffffff;

    private sprite:PIXI.TilingSprite;
    public readonly idX:number;
    public readonly idY:number;
    public readonly topTab:number;
    public readonly rightTab:number;
    public readonly bottomTab:number;
    public readonly leftTab:number;
    private dragging = false;
    private dragOffset:PIXI.Point = new PIXI.Point(0,0);
    private puzzle: Puzzle;

    private outline: PIXI.Graphics;

    constructor(private gameRoomComponent: GameRoomComponent, texture:Texture, p:PuzzlePiece, puzzle: Puzzle)
    {
        super();
        this.sprite = new PIXI.TilingSprite(texture);
        this.puzzle = puzzle;

        const width = puzzle.pieceWidth;
        const height = puzzle.pieceHeight;
        const offsetX = width*0.25;
        const offsetY = height*0.25;

        this.idX = p.idX;
        this.idY = p.idY;
        this.sprite.width = width+offsetX*2;
        this.sprite.height = height+offsetY*2;
        this.width = this.sprite.width;
        this.height = this.sprite.height;

        this.pivot.set(this.width/2, this.height/2)
        this.sprite.pivot.set(this.width/2, this.height/2);
        this.position.set(p.x, p.y);
        this.sprite.tilePosition.x = puzzle.puzzleWidth-width*p.idY+offsetX;
        this.sprite.tilePosition.y = puzzle.puzzleHeight-height*p.idX+offsetY;
        

        

        this.interactive = true;
        this.buttonMode = true;
        this.sprite.cacheAsBitmap = true;
        this.zIndex = 1;

        const puzzlePieces = gameRoomComponent.getPuzzlePieces();

        const randomValue = [-1,1];
        
        this.topTab = this.idX === 0 ? 0 : (puzzlePieces[this.idX-1][this.idY].bottomTab*-1);
        this.rightTab = this.idY === puzzle.puzzlePieces[0].length-1 ? 0 : randomValue[Math.floor(Math.random()*randomValue.length)];
        this.bottomTab = this.idX === puzzle.puzzlePieces.length-1 ? 0 : randomValue[Math.floor(Math.random()*randomValue.length)];
        this.leftTab = this.idY === 0 ? 0 : (puzzlePieces[this.idX][this.idY-1].rightTab*-1);

        this.sprite.mask = this.createMask(this.sprite.width/2, this.sprite.height/2, width, height);
        this.outline = this.createOutline(this.sprite.width/2, this.sprite.height/2, width, height);

        this.sprite.filters = [new BevelFilter(
            {thickness: Math.max(width*0.0175,1), lightAlpha: 0.15, shadowAlpha: 0.3, lightColor: 0xF7EFDA, rotation: 45, shadowColor: 0x000000
        })];
            
        
        this.addChild(this.sprite);
        this.addChild(this.outline);

        this.on('pointerdown', this.onDragStart)
        .on('pointerup', this.onDragEnd)
        .on('pointerupoutside', this.onDragEnd)
        .on('pointermove', this.onDragMove);


        this.clearOutline();
    }

    private createMask(x:number, y: number, width: number, height: number): PIXI.Graphics{
        return this.createShape(x,y,width,height, 0x3498db);

    }
    private createOutline(x:number, y: number, width: number, height: number): PIXI.Graphics{
        return this.createShape(x,y,width,height, undefined, Math.max(width*0.035,1), PuzzlePieceSprite.COLOR_OUTLINE_BASE, 0.9);
    }
    private createShape(x:number, y:number, width: number, height: number, fillColor?:number, lineWidth?:number, lineColor?:number, lineAlpha?:number): PIXI.Graphics {
        let shape = new PIXI.Graphics();

        if(fillColor){
            shape.beginFill(fillColor);
        }
        if(lineWidth && lineColor && lineAlpha){
            shape.lineStyle(lineWidth, lineColor, lineAlpha);
        }
        
        let topTab = this.topTab;
        let rightTab = this.rightTab;
        let bottomTab = this.bottomTab;
        let leftTab = this.leftTab;
        let tileWidth = width;
        let tileHeight = height;
        let tileRatio = (tileHeight)/100;
        let widthRatio = tileWidth/tileHeight;
        let topLeftEdge = new PIXI.Point(x-(tileWidth)/2,y-(tileHeight)/2);
        
        shape.moveTo(topLeftEdge.x, topLeftEdge.y);
        
        let curvyCoords = [
            0, 0, 35, 15, 37, 5,
            37, 5, 40, 0, 38, -5,
            38, -5, 20, -20, 50, -20,
            80, -20, 62, -5, 62, -5,
            60, 0, 63, 5, 63, 5,
            65, 15, 100, 0, 100, 0
            ];
    
    
        shape.moveTo(topLeftEdge.x, topLeftEdge.y);
    
        //Top
        for (var i = 0; i < curvyCoords.length / 6; i++) {
            var p1 = new PIXI.Point (topLeftEdge.x + curvyCoords[i * 6 + 0] * tileRatio * widthRatio,
            topLeftEdge.y + topTab * curvyCoords[i * 6 + 1] * tileRatio);
            var p2 = new PIXI.Point (topLeftEdge.x + curvyCoords[i * 6 + 2] * tileRatio * widthRatio,
            topLeftEdge.y + topTab * curvyCoords[i * 6 + 3] * tileRatio);
            var p3 = new PIXI.Point (topLeftEdge.x + curvyCoords[i * 6 + 4] * tileRatio * widthRatio,
            topLeftEdge.y + topTab * curvyCoords[i * 6 + 5] * tileRatio);
    
            shape.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
        //Right
        let topRightEdge = new PIXI.Point(topLeftEdge.x + tileWidth, topLeftEdge.y);
        for (let i = 0; i < curvyCoords.length / 6; i++) {
            let p1 = new PIXI.Point (topRightEdge.x + -rightTab * curvyCoords[i * 6 + 1] * tileRatio * widthRatio,
            topRightEdge.y + curvyCoords[i * 6 + 0] * tileRatio);
            let p2 = new PIXI.Point(topRightEdge.x + -rightTab * curvyCoords[i * 6 + 3] * tileRatio * widthRatio,
            topRightEdge.y + curvyCoords[i * 6 + 2] * tileRatio);
            let p3 = new PIXI.Point (topRightEdge.x + -rightTab * curvyCoords[i * 6 + 5] * tileRatio * widthRatio,
            topRightEdge.y + curvyCoords[i * 6 + 4] * tileRatio);
    
            shape.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
        
        //Bottom
        let bottomRightEdge = new PIXI.Point(topRightEdge.x, topRightEdge.y + tileHeight);
        for (let i = 0; i < curvyCoords.length / 6; i++) {
            let p1 = new PIXI.Point (bottomRightEdge.x - curvyCoords[i * 6 + 0] * tileRatio * widthRatio,
            bottomRightEdge.y - bottomTab * curvyCoords[i * 6 + 1] * tileRatio);
            let p2 = new PIXI.Point (bottomRightEdge.x - curvyCoords[i * 6 + 2] * tileRatio * widthRatio,
            bottomRightEdge.y - bottomTab * curvyCoords[i * 6 + 3] * tileRatio);
            let p3 = new PIXI.Point (bottomRightEdge.x - curvyCoords[i * 6 + 4] * tileRatio * widthRatio,
            bottomRightEdge.y - bottomTab * curvyCoords[i * 6 + 5] * tileRatio);
    
            shape.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
        //Left
        let bottomLeftEdge = new PIXI.Point(bottomRightEdge.x - tileWidth, bottomRightEdge.y);
        for (let i = 0; i < curvyCoords.length / 6; i++) {
            let p1 = new PIXI.Point (bottomLeftEdge.x - -leftTab * curvyCoords[i * 6 + 1] * tileRatio * widthRatio,
            bottomLeftEdge.y - curvyCoords[i * 6 + 0] * tileRatio);
            let p2 = new PIXI.Point (bottomLeftEdge.x - -leftTab * curvyCoords[i * 6 + 3] * tileRatio * widthRatio,
            bottomLeftEdge.y - curvyCoords[i * 6 + 2] * tileRatio);
            let p3 = new PIXI.Point (bottomLeftEdge.x - -leftTab * curvyCoords[i * 6 + 5] * tileRatio * widthRatio,
            bottomLeftEdge.y - curvyCoords[i * 6 + 4] * tileRatio);
    
            shape.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }

        return shape;
    }
    public setPosition(x: number, y: number): void {
        this.position.set(x,y);
    }
    public setOutline(color:string):void{

        this.outline.alpha = 1;
        this.outline.tint = Number.parseInt(color);
        
    }
    public clearOutline():void{

        this.outline.alpha = 0;
        
    }
    public sendZIndexBack():void{
        this.zIndex = -999;
    }
  private onDragStart(event:any):void {
    
    const target = event.currentTarget;
    if(this.puzzle.puzzlePieces[target.idX][target.idY].foundRealPosition){
        return;
    }
    
    const newPosition = event.data.getLocalPosition(target);
    this.dragOffset.set(newPosition.x * target.scale.x, newPosition.y * target.scale.y);
    
    this.dragging = true;
    this.gameRoomComponent.sendAttachPiece(PieceAttachType.ATTACHED, target.idX, target.idY);

    this.gameRoomComponent.stopPanning();
    
    this.gameRoomComponent.movingPiece = this.puzzle.puzzlePieces[this.idX][this.idY];
    
  }
  private onDragEnd(event:any):void {
    const target = event.currentTarget;

    this.dragging = false;
    this.gameRoomComponent.sendAttachPiece(PieceAttachType.DETACHED, target.idX, target.idY);
    
    this.gameRoomComponent.startPanning();
    
    this.zIndex = target.position.y-target.height/2;
    
    this.gameRoomComponent.movingPiece = undefined;
  }
  
  private onDragMove(event:any):void {
    if(this.dragging){
      
      this.gameRoomComponent.stopPanning();
      const target = event.currentTarget;
      const newPosition = event.data.getLocalPosition(target.parent);
      target.position.x = newPosition.x - this.dragOffset.x + this.pivot.x;
      target.position.y = newPosition.y - this.dragOffset.y + this.pivot.y;

      this.gameRoomComponent.movePieceGroup(
          { x: target.position.x,
            y: target.position.y,
            idX: this.idX,
            idY: this.idY,
            group: this.puzzle.puzzlePieces[target.idX][target.idY].group,
            foundRealPosition: this.puzzle.puzzlePieces[target.idX][target.idY].foundRealPosition
        });
      this.gameRoomComponent.sendMovePiece(target.position.x, target.position.y, this.idX, this.idY);
      
      this.zIndex = target.position.y+target.height/2;
    }
  }
}