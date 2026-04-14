import { QueueClient } from "@/components/admin/queue-client";

export default function AdminQueuePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">
          Publication Queue
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-white/40 mt-0.5">
          Drip-publish approved palettes on a fixed cadence to keep the feed
          fresh and improve indexing.
        </p>
      </div>
      <QueueClient />
    </div>
  );
}
