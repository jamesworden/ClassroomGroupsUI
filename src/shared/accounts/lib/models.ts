export interface Account {
  primaryEmail: string;
  accountId: string;
}

export interface GetAccountResponse {
  account: Account;
}
