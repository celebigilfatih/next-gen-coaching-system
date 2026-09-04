import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface HealthLogTimelineItemProps {
  log: any;
  index: number;
  totalLogs: number;
  getHealthStatusColor: (status: string) => string;
  getHealthStatusLabel: (status: string) => string;
}

export const HealthLogTimelineItem = ({
  log,
  index,
  totalLogs,
  getHealthStatusColor,
  getHealthStatusLabel,
}: HealthLogTimelineItemProps) => {
  return (
    <div className="group relative">
      {/* Timeline Line */}
      {index < totalLogs - 1 && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
      )}

      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-all duration-200">
        {/* Status Indicator */}
        <div
          className={`relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
            log.primaryStatus === "SAGLIKLI"
              ? "bg-green-500"
              : log.primaryStatus?.includes("SAKATILIK")
                ? "bg-red-500"
                : log.primaryStatus === "REHABILITASYON"
                  ? "bg-blue-500"
                  : "bg-orange-500"
          }`}
        >
          <Activity className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with Status and Date */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              className={getHealthStatusColor(log.primaryStatus || log.status)}
            >
              {getHealthStatusLabel(log.primaryStatus || log.status)}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(log.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Injury Details */}
          {log.injuryType && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium">Sakatlık: {log.injuryType}</p>
              {log.muscleInjurySubtype && (
                <p className="text-xs text-muted-foreground">
                  → {log.muscleInjurySubtype}
                </p>
              )}
              {log.ligamentInjurySubtype && (
                <p className="text-xs text-muted-foreground">
                  → {log.ligamentInjurySubtype}
                </p>
              )}
              {log.tendonInjurySubtype && (
                <p className="text-xs text-muted-foreground">
                  → {log.tendonInjurySubtype}
                </p>
              )}
              {log.boneInjurySubtype && (
                <p className="text-xs text-muted-foreground">
                  → {log.boneInjurySubtype}
                </p>
              )}
            </div>
          )}

          {/* Body Part */}
          {log.bodyPart && (
            <p className="text-sm text-muted-foreground mt-1">
              Bölge: {log.bodyPart}
            </p>
          )}

          {/* Rehab & Training */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {log.rehabPhase && (
              <Badge variant="outline" className="text-xs">
                Rehab: {log.rehabPhase}
              </Badge>
            )}
            {log.trainingParticipation && (
              <Badge variant="outline" className="text-xs">
                {log.trainingParticipation}
              </Badge>
            )}
            {log.estimatedReturnDays && (
              <Badge variant="outline" className="text-xs">
                Dönüş: {log.estimatedReturnDays}
              </Badge>
            )}
          </div>

          {/* Clinical Notes */}
          {log.clinicalNotes && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Klinik Notlar:
              </p>
              <p className="text-sm text-slate-700">{log.clinicalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
