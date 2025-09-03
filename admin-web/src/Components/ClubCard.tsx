import type { ClubItem } from "../types";

type Props = {
  club: ClubItem;
  onView: (club: ClubItem) => void;
  onApprove: (id: string) => void;
};

export default function ClubCard({ club, onView, onApprove }: Props) {
  return (
    <div
      className="w-full bg-surface-elevated border border-brand rounded-2xl p-4 hover:border-[var(--accent-blue)] transition-colors cursor-pointer"
      onClick={() => onView(club)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-4 min-h-[7rem]">
        {club.logoUrl ? (
          <img src={club.logoUrl} alt={club.name} className="w-20 h-20 object-cover rounded-xl border border-brand flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-xl border border-brand bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)]">—</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate">{club.name}</div>
          {club.typeOfVenue && (
            <div className="text-[var(--text-secondary)] text-xs mt-0.5">Venue: {club.typeOfVenue}</div>
          )}
          {club.clubDescription && (
            <div className="text-[var(--text-secondary)] text-sm mt-2 line-clamp-2">{club.clubDescription}</div>
          )}
          <div className="text-muted text-[13px] mt-2 truncate">{club.address}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onView(club); }}
            className="px-3 py-2 rounded-lg bg-surface text-[var(--text-primary)] border border-brand hover:bg-[var(--surface)] transition-colors cursor-pointer"
          >
            View
          </button>
          {!club.isApproved && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(club._id); }}
              className="px-3 py-2 rounded-lg btn-primary font-semibold hover:opacity-90 transition-colors cursor-pointer"
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


