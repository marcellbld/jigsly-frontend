import { PuzzlePiece } from "./puzzle-piece";

export interface Puzzle {
    puzzleWidth: number;
    puzzleHeight: number;
    pieceWidth: number;
    pieceHeight: number;
    piecesX: number;
    piecesY: number;
    puzzlePieces: PuzzlePiece[][];
    imageBase64: string;
    worldWidth: number;
    worldHeight: number;
}