import React from "react";
import { Link } from "@inertiajs/react";
import { CheckCircle2, Clock, Image as ImageIcon, MapPin } from "lucide-react";
import { formatDate, getFeedbackStatusBadge } from "@/lib/utils";

export default function FeedbackCard({ feedback, isManager, onQuickStatus }) {
    return (
        <Link
            href={`/feedback/${feedback.id}`}
            className="card p-5 hover:border-emerald-300 hover:shadow-card-hover transition-all flex flex-col justify-between"
        >
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={`badge ${getFeedbackStatusBadge(feedback.status)} text-xs`}
                    >
                        {feedback.status}
                    </span>
                    {feedback.image && (
                        <span
                            className="text-gray-400 dark:text-slate-500"
                            title="Memiliki lampiran foto"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm line-clamp-2">
                    {feedback.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {feedback.message}
                </p>
            </div>
            <div className="space-y-2 pt-3 mt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                    <span className="truncate max-w-[150px]">
                        {feedback.land_use?.name || "Laporan Umum"}
                    </span>
                    <span>{formatDate(feedback.created_at)}</span>
                </div>
                {feedback.land_use && (
                    <div>
                        <Link
                            href={`/map?campus_id=${feedback.land_use.campus_id}&land_use_id=${feedback.land_use_id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 font-medium"
                        >
                            <MapPin className="w-3 h-3" />
                            Lihat di Peta
                        </Link>
                    </div>
                )}
                {isManager && (
                    <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-gray-100/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase">
                            Tandai:
                        </span>
                        <div className="flex items-center gap-1">
                            {feedback.status !== "Diproses" && (
                                <button
                                    type="button"
                                    onClick={(event) =>
                                        onQuickStatus(
                                            event,
                                            feedback.id,
                                            "Diproses",
                                        )
                                    }
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 border border-amber-200 flex items-center gap-1"
                                >
                                    <Clock className="w-3 h-3" />
                                    Proses
                                </button>
                            )}
                            {feedback.status !== "Selesai" && (
                                <button
                                    type="button"
                                    onClick={(event) =>
                                        onQuickStatus(
                                            event,
                                            feedback.id,
                                            "Selesai",
                                        )
                                    }
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Selesai
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
