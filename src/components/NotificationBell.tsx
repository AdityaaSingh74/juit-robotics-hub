import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(event) {
      // @ts-ignore
      if (open && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Keyboard accessibility
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button className="relative" variant="ghost" aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 py-0 pointer-events-none">
            {unreadCount <= 9 ? unreadCount : '9+'}
          </Badge>
        )}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 right-0 mt-2 w-96 max-w-[98vw] shadow-lg bg-surface border border-border rounded-lg"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border justify-between">
              <span className="text-base font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 rounded-md px-3 py-2 mb-1 cursor-pointer hover:bg-muted/40 ${!n.read ? 'bg-accent/10' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="font-[500] leading-tight text-[15px]">
                        {n.title}
                      </div>
                      <div className="text-xs mt-0.5 text-muted-foreground mb-0.5">{n.message}</div>
                      {n.link && (
                        <Link to={n.link} className="text-xs text-accent hover:underline">
                          View details
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.read && (
                        <Button size="xs" variant="ghost" onClick={() => markAsRead(n.id)}>
                          Mark as read
                        </Button>
                      )}
                      <Button size="xs" variant="ghost" color="red" onClick={() => deleteNotification(n.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
