import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatDate, formatTime } from "@/lib/utils";

interface AppointmentData {
  id: string;
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
  patientAge?: number;
  date: string;
  reason: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  type?: string;
  notes?: string;
  phone?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  perspective?: "patient" | "doctor";
  onAction?: (action: "confirm" | "cancel" | "view-history", id: string) => void;
  className?: string;
}

export function AppointmentCard({
  appointment,
  perspective = "patient",
  onAction,
  className,
}: AppointmentCardProps) {
  const { id, date, reason, status, type, notes } = appointment;
  const statusVariant = statusToBadgeVariant(status);

  const displayName = perspective === "patient" ? appointment.doctorName : appointment.patientName;
  const displaySub =
    perspective === "patient"
      ? appointment.doctorSpecialty
      : appointment.patientAge
        ? `Age ${appointment.patientAge}`
        : appointment.phone;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {displayName && <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>}
          {displaySub && <p className="text-sm text-gray-500 truncate">{displaySub}</p>}
        </div>
        <Badge variant={statusVariant} dot>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(date)}
        </span>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatTime(date)}
        </span>
        {type && (
          <Badge variant="info" size="sm">
            {type}
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Reason: </span>
        {reason}
      </p>
      {notes && <p className="text-xs text-gray-500 italic line-clamp-2">{notes}</p>}

      {onAction && status === "pending" && perspective === "doctor" && (
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="success"
            onClick={() => onAction("confirm", id)}
            className="flex-1"
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onAction("cancel", id)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
