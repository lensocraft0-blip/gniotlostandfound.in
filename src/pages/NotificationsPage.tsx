import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { CampusNotification } from '../types/database';
import { DataService } from '../services/dataService';
import { Bell, CheckCheck, Sparkles, Shield, ArrowRight, Clock } from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
  onRefreshUnreadCount?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onNavigate,
  onRefreshUnreadCount,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await DataService.getNotifications(user.id);
      setNotifications(data);
      if (onRefreshUnreadCount) onRefreshUnreadCount();
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.read_at) {
        await DataService.markNotificationRead(n.id);
      }
    }
    loadNotifications();
  };

  const handleNotificationClick = async (notif: CampusNotification) => {
    if (!notif.read_at) {
      await DataService.markNotificationRead(notif.id);
    }
    if (notif.related_item_id) {
      onNavigate('item_details', notif.related_item_id);
    }
    loadNotifications();
  };

  const displayedNotifs = filterUnread
    ? notifications.filter((n) => !n.read_at)
    : notifications;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">Notifications</h1>
          <p className="text-xs text-[#BFC8D2] mt-0.5">
            System notices, claim updates, and AI heuristic match alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              filterUnread
                ? 'border-[#D9A441] text-[#D9A441] bg-[#30152F]'
                : 'border-[#E8EDF2]/15 text-[#BFC8D2] hover:text-[#E8EDF2]'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Show Unread Only'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] flex items-center gap-1.5 hover:bg-[#30152F]"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : displayedNotifs.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-2">
          <Bell className="w-8 h-8 mx-auto text-[#BFC8D2]/40" />
          <p className="text-sm font-semibold text-[#E8EDF2]">No notifications</p>
          <p className="text-xs text-[#BFC8D2]">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifs.map((notif) => {
            const isUnread = !notif.read_at;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl glass-card border transition-all cursor-pointer flex items-start justify-between gap-4 text-xs ${
                  isUnread
                    ? 'border-[#D9A441]/40 bg-[#30152F]/40'
                    : 'border-[#E8EDF2]/10 bg-[#1D1020]/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {notif.type === 'match_found' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#D9A441] font-bold">
                        <Sparkles className="w-3 h-3" /> MATCH ALERT
                      </span>
                    )}
                    {notif.type === 'claim_approved' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 font-bold">
                        <Shield className="w-3 h-3" /> CLAIM APPROVED
                      </span>
                    )}
                    {notif.type === 'admin_notice' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#BFC8D2] font-bold">
                        CAMPUS ANNOUNCEMENT
                      </span>
                    )}

                    <span className="text-[10px] text-[#BFC8D2]/60">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>

                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-[#E8EDF2] font-display">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-[#BFC8D2] leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {notif.related_item_id && (
                  <button className="text-xs text-[#D9A441] hover:underline flex items-center gap-1 shrink-0 self-center">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
