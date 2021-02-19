import { PuzzlePiece } from "./puzzle-piece";

export interface PieceMoveMessage {
    x:number,
    y: number,
    idX: number,
    idY: number,
    group: number
}