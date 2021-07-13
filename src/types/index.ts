
export enum ErrorMessage {
    WRONG_ARGUMENTS = 'Wrong arguments',
    USER_ALREADY_EXISTS = 'User already exists',
    USER_DOES_NOT_EXIST = 'User does not exist',
    NOT_ENOUGH_MONEY = 'Not enough money',
    WALLET_ALREADY_EXISTS = 'Wallet already exists',
    SENDER_DOES_NOT_EXIST = 'Sender does not exist',
    RECEIVER_DOES_NOT_EXIST = 'Receiver does not exist',
}
export type Ok = { success: true };
export type Error = { success: false, message: string };

export type WrongArguments = Error & { message: ErrorMessage.WRONG_ARGUMENTS }
export type UserAlreadyExists = Error & { message: ErrorMessage.USER_ALREADY_EXISTS }
export type UserDoesNotExist = Error & { message: ErrorMessage.USER_DOES_NOT_EXIST }
export type NotEnoughMoney = Error & { message: ErrorMessage.NOT_ENOUGH_MONEY }
export type SenderDoesNotExist = Error & { message: ErrorMessage.SENDER_DOES_NOT_EXIST }
export type ReceiverDoesNotExist = Error & { message: ErrorMessage.RECEIVER_DOES_NOT_EXIST }

export type BankingError = Error | 
  WrongArguments | 
  UserAlreadyExists | 
  UserDoesNotExist |
  NotEnoughMoney | 
  SenderDoesNotExist | 
  ReceiverDoesNotExist;

export type TransactionBalance = {
    fromUsernameBalance: number,
    toUsernameBalance: number
};
