import { PieceAttachType } from "../enum/attach-type.enum";
import { PuzzlePiece } from "./puzzle-piece";

export interface PieceAttachMessage{
    username: string | null,
    type: PieceAttachType,
    idX: number,
    idY: number,
    joinedPieces: PuzzlePiece[]
}