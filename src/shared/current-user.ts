export interface CurrentUser {
  readonly id: number;
}

const labThreeUser: CurrentUser = Object.freeze({ id: 1 });

// ЛР-3: один фиксированный создатель; авторизация появится в ЛР-4.
export function currentUser(): CurrentUser {
  return labThreeUser;
}
