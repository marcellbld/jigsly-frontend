import { JoinType } from "../enum/join-type.enum";
import { User } from "./user";

export interface JoinMessage {
    user: User;
    type: JoinType;
    roomId: number;
    color: string;
}