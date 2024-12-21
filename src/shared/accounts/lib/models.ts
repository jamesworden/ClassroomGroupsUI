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
  subscriptionType: SubscriptionType;
  maxClassrooms: number;
  maxConfigurationsPerClassroom: number;
  maxFieldsPerClassroom: number;
  maxStudentsPerClassroom: number;
}

export enum SubscriptionType {
  Free = 'FREE',
  Basic = 'BASIC',
  Pro = 'PRO',
}
