import { orderBy } from 'firebase/firestore';
import { Timer } from 'lucide-react';
import CollectionBoard from '../components/data/CollectionBoard';
import { toDate } from '../lib/format';

function formatWhen(row) {
  const d = toDate(row.event_time);
  return d ? d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

export default function ActivityScheduler() {
  return (
    <CollectionBoard
      path="events"
      icon={Timer}
      title="Activity Scheduler"
      subtitle="Internal activities and reminders, notified to everyone on save."
      ctaLabel="Schedule activity"
      orderConstraint={orderBy('createdAt', 'desc')}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'event_time', label: 'Date', type: 'date', required: true },
      ]}
      columns={[
        { key: 'title', label: 'Activity' },
        { key: 'description', label: 'Description' },
        { key: 'event_time', label: 'When', render: formatWhen },
      ]}
    />
  );
}
