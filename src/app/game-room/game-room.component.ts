import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as PIXI from 'pixi.js';
import { PieceAttachType } from '../shared/enum/attach-type.enum';
import { JoinType } from '../shared/enum/join-type.enum';
import { JoinMessage } from '../shared/models/join-message';
import { Puzzle } from '../shared/models/puzzle';
import { PuzzlePiece } from '../shared/models/puzzle-piece';
import { User } from '../shared/models/user';
import { PuzzlePieceSprite } from './pixijs/PuzzlePieceSprite';
import { GameRoomService } from '../core/services/game-room.service';
import { Viewport } from 'pixi-viewport';
import { Subscription } from 'rxjs';
import { GameRoom } from '../shared/models/game-room';
import { NotificationService } from '../core/services/notification.service';
import { NotificationType } from '../shared/enum/notification-type.enum';


@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, OnDestroy {

  @ViewChild('pixiContainer') public pixiContainer:any;

  private subscriptions: Subscription[] = [];
  public pApp: any;
  public pLoader: any;

  public viewport: Viewport | undefined;
  public id: number | null = null;
  public players: User[] = [];
  public puzzle: Puzzle | undefined;

  public movingPiece: PuzzlePiece | undefined;

  private puzzlePieces: PuzzlePieceSprite[][] = [];
  private spriteContainer: PIXI.Container = new PIXI.Container();
  private puzzleTexture: PIXI.Texture | undefined;

  public gameRoom: GameRoom | undefined;
  private bgPuzzleSprite: PIXI.Sprite | undefined;


  constructor(private route: ActivatedRoute, private router: Router, 
    private gameRoomService: GameRoomService, private notificationService: NotificationService) 
  {
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.gameRoomService.leave(this.id);
  }

  public getPuzzlePieces(): PuzzlePieceSprite[][]
  {
    return this.puzzlePieces;
  }

  private setupViewport():void{
    
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.puzzle?.worldWidth,
      worldHeight: this.puzzle?.worldHeight,

      interaction: this.pApp.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    
    this.viewport?.clamp({direction:'all'});
    this.viewport?.clampZoom({
      minWidth: this.viewport.screenWidth/3, 
      minHeight: this.viewport.screenHeight/3, 
      maxWidth: this.viewport.worldWidth,
      maxHeight: this.viewport.worldHeight,
      });
      
    this.spriteContainer.sortableChildren = true;

    this.pApp.stage.addChild(this.viewport);
    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();
  }


  private async loadPuzzleTexture(puzzle: Puzzle){
    let texture = await PIXI.Texture.fromURL(puzzle.imageBase64);
    this.puzzleTexture = texture;
  }
  private loadPuzzle(puzzle: Puzzle){
    
    this.puzzlePieces = new Array(puzzle.puzzlePieces.length)
              .fill(undefined)
              .map(() => new Array(puzzle.puzzlePieces[0].length)
              .fill(undefined));

        puzzle.puzzlePieces.forEach(parr => parr.forEach(p => {
          
          const ps = new PuzzlePieceSprite(this, this.puzzleTexture!, p, puzzle);
          
          this.spriteContainer.addChild(ps);

          this.puzzlePieces[p.idX][p.idY] = ps;
        }));

  }

  public movePieceGroup(data: PuzzlePiece){
    this.puzzle?.puzzlePieces.forEach(pArr => 
      pArr.filter(p => p.group == data.group && !(p.idX === data.idX && p.idY === data.idY))
          .forEach(p => {
            //tween test
            this.puzzlePieces[p.idX][p.idY].setPosition(
              data.x + (p.idY-data.idY)*this.puzzle?.pieceWidth!,
              data.y + (p.idX-data.idX)*this.puzzle?.pieceHeight!
            )
            //p.x = data.x;
            //p.y = data.y;
          })
);
  }
  setup():void{
    const getGameRoom$ = this.gameRoomService.getGameRoom().subscribe({
      next: (data) => {
        this.gameRoom = data;
        const userColors = Object.assign({}, data.userColors);
        this.gameRoom.userColors = new Map();

        for (const [key, value] of Object.entries(userColors)) {
          this.gameRoom.userColors.set(key, value);
        }

        this.players = data.users;

        const playerJoinedEvent$ = this.gameRoomService.playerJoinedEvent.subscribe({
          next: (joinMessage: JoinMessage) => {
            if(joinMessage.type == JoinType.CONNECTED){
              this.gameRoom?.userColors.set(joinMessage.user.username, joinMessage.color);

              this.players.push(joinMessage.user);
              
              this.notificationService.notify(NotificationType.INFO, "Player joined: "+joinMessage.user.username);
            }
            else if(joinMessage.type == JoinType.DISCONNECTED){
              this.players.splice(this.players.findIndex(user => user.username === joinMessage.user.username), 1);
              this.notificationService.notify(NotificationType.INFO, "Player left: "+joinMessage.user.username);
            }
          }
        });
        
        const pieceMoveEvent$ = this.gameRoomService.pieceMoveEvent.subscribe({
          next: (data:any) => {
            
            if(!this.movingPiece || (this.movingPiece && !(this.movingPiece.idX === data.idX && this.movingPiece.idY === data.idY)))
            {  
              this.movePiece(data.x, data.y, data.idX, data.idY);
              this.movePieceGroup(data);
            }
          }
        });
        const pieceAttachEvent$ = this.gameRoomService.pieceAttachEvent.subscribe({
          next: (data:any) => {
            const piece = this.puzzle!.puzzlePieces[data.idX][data.idY];
            
            const pieceSprite = this.puzzlePieces[data.idX][data.idY];
            if(data.type === PieceAttachType.DETACHED){
              if(data.idX === this.movingPiece?.idX && data.idY === this.movingPiece?.idY){
                this.movingPiece = undefined;
              }
              data.joinedPieces.forEach( (p:PuzzlePiece) => {
                this.puzzle!.puzzlePieces[p.idX][p.idY].group = p.group;
                this.puzzle!.puzzlePieces[p.idX][p.idY].foundRealPosition = p.foundRealPosition;

                this.movePiece(p.x,p.y, p.idX, p.idY);
                
                if(p.foundRealPosition){
                  pieceSprite.sendZIndexBack();
                }
                
              });
              pieceSprite.clearOutline();
            }
            else if(data.type === PieceAttachType.ATTACHED){
              if(piece !== this.movingPiece){
                pieceSprite.setOutline(this.gameRoom?.userColors.get(data.username)!);
              }
            }
          }
        });

        this.subscriptions.push(playerJoinedEvent$, pieceMoveEvent$, pieceAttachEvent$);

        this.bgPuzzleSprite = new PIXI.Sprite(this.puzzleTexture);
        this.bgPuzzleSprite.position.set(this.puzzle?.worldWidth!/2-this.puzzleTexture?.width!/2, this.puzzle?.worldHeight!/2-this.puzzleTexture?.height!/2);
        this.bgPuzzleSprite.alpha = 0.25;

        this.viewport?.addChild(this.bgPuzzleSprite);
        this.viewport?.addChild(this.spriteContainer);
        this.viewport?.moveCenter(this.bgPuzzleSprite.position.x + this.bgPuzzleSprite.width/2, this.bgPuzzleSprite.position.y + this.bgPuzzleSprite.height/2);
        this.viewport?.setZoom(0.5, true);
      }
    });

    this.subscriptions.push(getGameRoom$);

    
  }
  public zoomIn():void {
    this.viewport?.zoom(-250, true);
  }
  public zoomOut():void {
    this.viewport?.zoom(250, true);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as number | null;

    this.pApp = new PIXI.Application({ 
      antialias: true,
      transparent: false,
      backgroundColor: 0x3a3a3a,
      resolution: 1,
      resizeTo: document.querySelector('body')!
    });
    this.pApp.renderer.autoResize = true;

    if(this.id != null){
      this.gameRoomService.join(this.id);

      const getPuzzle$ = this.gameRoomService.getPuzzle().subscribe({
        next: async (data) => {
          this.puzzle = data;

          this.setupViewport();

          this.puzzle.puzzlePieces = this.puzzle.puzzlePieces.map((arr, idY) => arr.map((p, idX) => {
           return {x: p.x, y: p.y, idX: idY, idY: idX, group: p.group, foundRealPosition: p.foundRealPosition};
          }));
          await this.loadPuzzleTexture(this.puzzle);
          
          this.setup();
          this.loadPuzzle(this.puzzle!);
        }
      });
      this.subscriptions.push(getPuzzle$);
    }
  }

  public stopPanning():void{
    this.viewport?.plugins.pause('drag');
  }
  public startPanning():void{
    this.viewport?.plugins.resume('drag');
  }
  
  ngAfterViewInit() {
    this.pixiContainer.nativeElement.appendChild(this.pApp.view);
  }
  
  public movePiece(x: number, y: number, idX: number, idY: number):void{
    const piece = this.puzzlePieces[idX][idY];
    piece.position.set(x,y);
  }

  public sendAttachPiece(type: PieceAttachType, idX: number, idY: number):void{
    this.gameRoomService.attachPiece({username: null, type: type,
      idX: idX, idY: idY, joinedPieces: []});
  }

  public sendMovePiece(x: number, y: number, idX: number, idY: number):void{
    this.gameRoomService!.movePiece({x: x, y: y, idX: idX, idY: idY, group: this.puzzle?.puzzlePieces[idX][idY].group! });
  }

}

