export interface Account {
  primaryEmail: string;
  accountId: string;
  subscription: Subscription;
}

export interface GetAccountResponse {
  account: Account;
}

export interface Subscription {
  displayName: string;
  id: string;
  maxClassrooms: number;
  maxConfigurationsPerClassroom: number;
  maxFieldsPerClassroom: number;
  maxStudentsPerClassroom: number;
}
