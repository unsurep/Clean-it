
export interface UserProfile {
  uid: string;
  name: string;
  quitDate: string; // ISO string
  reason: string;
  todaysMessage?: string;
  lastMessageDate?: string; // YYYY-MM-DD
}

export interface OnboardingData {
  name: string;
  quitDate: string;
  reason: string;
}
