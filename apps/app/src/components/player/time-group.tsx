import { Time } from "@vidstack/react";

export function TimeGroup() {
  return (
    <div className="ml-2.5 flex items-center text-sm font-medium">
      <Time className="time" type="current" />
      <div className="yn-1 text-white/80">/</div>
      <Time className="time" type="duration" />
    </div>
  );
}
