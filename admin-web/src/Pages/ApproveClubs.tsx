import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import type { ClubItem } from "../types";
import { AdminShell } from "../Components/Shell";
import ClubCard from "../Components/ClubCard";

export default function ApproveClubs() {
  const [items, setItems] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>("pending");
  const [type, setType] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [selected, setSelected] = useState<ClubItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [detailsById, setDetailsById] = useState<Record<string, Partial<ClubItem>>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.name, c.email, c.phone, c.address].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (type) params.type = type;
      if (city) params.city = city;
      if (search) params.search = search;
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/api/v1/admin/clubs/pending${query ? `?${query}` : ""}`);
      setItems(res.data.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const fetchMissingDetails = async () => {
      const idsToFetch = items
        .filter((c) => !detailsById[c._id])
        .map((c) => c._id);
      if (idsToFetch.length === 0) return;
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const res = await api.get(`/api/v1/admin/clubs/${id}`);
            const club: Partial<ClubItem> = res.data?.club || res.data?.item || res.data;
            if (club && typeof club === 'object') {
              setDetailsById((prev) => ({ ...prev, [id]: club }));
            }
          } catch {
            // ignore per-item failure; keep list usable
          }
        })
      );
    };
    if (items.length > 0) fetchMissingDetails();
  }, [items, detailsById]);

  const approve = async (id: string) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post(`/api/v1/admin/clubs/${id}/approve`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      setMessage("Approved successfully");
      setSelected(null);
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Approve failed");
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async (id: string) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post(`/api/v1/admin/clubs/${id}/reject`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      setMessage("Rejected successfully");
      setSelected(null);
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Reject failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell active="approve">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-1/3 -left-1/3 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(closest-side, rgba(78,162,255,0.20), rgba(78,162,255,0))" }} />
          <div className="absolute -bottom-1/3 -right-1/3 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(closest-side, rgba(249,214,92,0.10), rgba(249,214,92,0))" }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
          <h2 className="text-xl font-semibold flex-1">Pending Clubs</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-brand outline-none placeholder:text-[var(--text-secondary)] hover:border-[var(--accent-blue)] focus:border-[var(--accent-blue)] transition-colors"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); searchInputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md bg-surface-elevated border border-brand text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button onClick={load} className="px-3 py-2 rounded-xl btn-primary font-bold cursor-pointer hover:opacity-90 active:translate-y-px">Refresh</button>
            <button onClick={() => setFiltersOpen((v) => !v)} className="px-3 py-2 rounded-xl bg-surface-elevated text-[var(--text-secondary)] border border-brand cursor-pointer hover:bg-[var(--surface)]">Filters</button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mb-4 p-3 rounded-xl bg-surface-elevated border border-brand grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-secondary)] text-sm">Status</label>
              <div className="flex gap-2">
                {(["pending","approved","all"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={["px-3 py-2 rounded-full border", status === s ? "bg-[var(--accent-yellow)] text-black border-[var(--accent-yellow)]" : "bg-surface text-[var(--text-secondary)] border-brand"].join(" ")}
                  >{s[0].toUpperCase()+s.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-secondary)] text-sm">Type of Venue</label>
              <input value={type} onChange={(e)=>setType(e.target.value)} placeholder="e.g., Nightclub, Lounge" className="px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-brand outline-none placeholder:text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-secondary)] text-sm">City</label>
              <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="e.g., Dubai" className="px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-brand outline-none placeholder:text-[var(--text-secondary)]" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2">
              <button onClick={()=>{ setType(""); setCity(""); setStatus("pending"); }} className="px-3 py-2 rounded-xl bg-surface text-[var(--text-primary)] border border-brand cursor-pointer">Reset</button>
              <button onClick={load} className="px-3 py-2 rounded-xl btn-primary font-bold cursor-pointer">Apply</button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)] text-[var(--text-primary)] p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {loading ? (
            <div>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-[var(--text-secondary)]">No clubs</div>
          ) : (
            filtered.map((c) => {
              const merged = { ...c, ...(detailsById[c._id] || {}) } as ClubItem;
              return (
                <ClubCard key={c._id} club={merged} onView={setSelected} onApprove={(id) => { if (window.confirm('Approve this club?')) { approve(id); } }} />
              );
            })
          )}
        </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-surface-elevated border border-brand rounded-2xl p-0 overflow-hidden">
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-brand bg-surface-elevated rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selected.name}</h3>
                  <p className="text-[var(--text-secondary)] text-xs break-all">ID: {selected._id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="px-3 py-1.5 rounded-lg bg-surface text-[var(--text-primary)] border border-brand hover:bg-[var(--surface)] cursor-pointer">✕</button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar px-6 py-4">
              <div className="mb-4">
                <p className="text-[var(--text-secondary)] text-sm">Created: {new Date(selected.createdAt).toLocaleString()} {selected.updatedAt ? `• Updated: ${new Date(selected.updatedAt).toLocaleString()}` : ''}</p>
              </div>

            {(selected.coverBannerUrl || selected.logoUrl) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {selected.coverBannerUrl && (
                  <a href={selected.coverBannerUrl} target="_blank" rel="noreferrer" className="block">
                    <img src={selected.coverBannerUrl} alt="Cover" className="w-full h-32 object-cover rounded-xl border border-brand hover:border-[var(--accent-blue)]" />
                  </a>
                )}
                {selected.logoUrl && (
                  <a href={selected.logoUrl} target="_blank" rel="noreferrer" className="block">
                    <img src={selected.logoUrl} alt="Logo" className="w-full h-32 object-contain rounded-xl border border-brand hover:border-[var(--accent-blue)] bg-[var(--surface)]" />
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 text-sm">
              {selected.clubDescription && (
                <div><span className="text-[var(--text-secondary)]">Description:</span> {selected.clubDescription}</div>
              )}
              {selected.typeOfVenue && (
                <div><span className="text-[var(--text-secondary)]">Type:</span> {selected.typeOfVenue}</div>
              )}
              <div><span className="text-[var(--text-secondary)]">Email:</span> {selected.email}</div>
              <div><span className="text-[var(--text-secondary)]">Phone:</span> {selected.phone}</div>
              <div><span className="text-[var(--text-secondary)]">Address:</span> {selected.address}</div>
              {selected.mapLink && (
                <div><span className="text-[var(--text-secondary)]">Map:</span> <a className="text-[var(--accent-blue)] underline hover:opacity-80" href={selected.mapLink} target="_blank" rel="noreferrer">Open map</a></div>
              )}
              {selected.operatingDays && selected.operatingDays.length > 0 && (
                <div><span className="text-[var(--text-secondary)]">Operating days:</span> {selected.operatingDays.join(', ')}</div>
              )}
              {selected.events && selected.events.length > 0 && (
                <div><span className="text-[var(--text-secondary)]">Events:</span> {selected.events.length}</div>
              )}
            </div>

            {selected.photos && selected.photos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Photos</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selected.photos.map((url, i) => (
                    <a key={`photo-${i}`} href={url} target="_blank" rel="noreferrer" className="block">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover rounded-lg border border-brand hover:border-[var(--accent-blue)]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selected.clubImages && selected.clubImages.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Club Images</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selected.clubImages.map((url, i) => (
                    <a key={`clubimg-${i}`} href={url} target="_blank" rel="noreferrer" className="block">
                      <img src={url} alt={`Club image ${i + 1}`} className="w-full h-28 object-cover rounded-lg border border-brand hover:border-[var(--accent-blue)]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

              {message && (
                <div className="mt-4 text-center text-[var(--text-secondary)] text-sm">{message}</div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-brand flex gap-3 justify-end bg-surface-elevated">
              <button onClick={() => setSelected(null)} className="px-4 py-3 rounded-xl bg-surface text-[var(--text-primary)] border border-brand hover:bg-[var(--surface)] transition-colors cursor-pointer">Close</button>
              <button onClick={() => { if (window.confirm('Reject this club?')) { reject(selected._id); } }} disabled={submitting} className="px-4 py-3 rounded-xl bg-surface text-[var(--text-primary)] border border-brand hover:bg-[var(--surface)] transition-colors cursor-pointer">Reject</button>
              {!selected.isApproved && (
                <button onClick={() => { if (window.confirm('Approve this club?')) { approve(selected._id); } }} disabled={submitting} className="px-4 py-3 rounded-xl btn-primary font-semibold hover:opacity-90 transition-colors cursor-pointer">Approve</button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}


