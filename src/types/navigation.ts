export type PageId =
  | 'landing'
  | 'signup'
  | 'login'
  | 'auth_recovery'
  | 'onboarding'
  | 'dashboard'
  | 'report_lost'
  | 'report_found'
  | 'browse'
  | 'item_details'
  | 'ai_matches'
  | 'visual_search'
  | 'my_reports'
  | 'my_claims'
  | 'notifications'
  | 'aura_assistant'
  | 'campus_locations'
  | 'profile_settings'
  | 'admin_dashboard'
  | 'admin_reports'
  | 'admin_claims'
  | 'admin_audit'
  | 'offline_state'
  | 'not_found';

export interface NavigationState {
  page: PageId;
  itemId?: string;
  claimId?: string;
  searchFilter?: {
    query?: string;
    category?: string;
    location?: string;
    reportType?: 'lost' | 'found';
  };
}
