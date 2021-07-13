import { User } from "../interface";
import { v4 } from "uuid";
import * as db from "../persistence";
import { ErrorMessage } from "../types";

export const create = (username: string): User => {
    let user, newUser: User;

    try {
        user = findByUsername(username);
    } catch (e) {
        newUser = {
            id: v4(),
            username: username,
        };

        db.users.push(newUser);
    }

    if (user) throw new Error(ErrorMessage.USER_ALREADY_EXISTS);
    return newUser!;
};

export const findByUsername = (username: string): User => {
    let user = db.users.find((user) => user.username === username);
    if (user === undefined) throw new Error(ErrorMessage.USER_DOES_NOT_EXIST);
    return user;
};
