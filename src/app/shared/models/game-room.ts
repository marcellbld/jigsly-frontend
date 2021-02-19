import { User } from "./user";

export interface GameRoom {
    id: number;
    users: User[];
    maximumUsers: number;
    created: string;
    thumbnailBase64: string;
    pieces: number;
    userColors: Map<string, string>;
}