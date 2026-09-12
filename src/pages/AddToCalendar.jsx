import { orderBy } from 'firebase/firestore';
import { CalendarPlus } from 'lucide-react';
import CollectionBoard from '../components/data/CollectionBoard';
import { toDate } from '../lib/format';

function formatDate(row) {
  const d = toDate(row.event_time);
  return d ? d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

export default function AddToCalendar() {
  return (
    <CollectionBoard
      path="companyEvents"
      icon={CalendarPlus}
      title="Add to Calendar"
      subtitle="Company events that sync to everyone's device calendar."
      ctaLabel="Add event"
      orderConstraint={orderBy('createdAt', 'desc')}
      fields={[
        { name: 'title', label: 'Event title', required: true },
        { name: 'location', label: 'Location' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'event_time', label: 'Date', type: 'date', required: true },
      ]}
      columns={[
        { key: 'title', label: 'Event' },
        { key: 'location', label: 'Location' },
        { key: 'event_time', label: 'Date', render: formatDate },
      ]}
    />
  );
}
