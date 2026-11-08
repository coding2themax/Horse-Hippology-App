import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import type { Horse, Owner } from '../types/registry.ts';
import './HorseOwnerRegistry.css';

/** Form fields are kept as strings while the user types. */
type OwnerForm = Omit<Owner, 'id'>;
type HorseForm = { name: string; breed: string; age: string; color: string; ownerId: string };

/** 'all', 'none' (no owner), or an owner id. */
type OwnerFilter = string;

const EMPTY_OWNER: OwnerForm = { name: '', phone: '', email: '' };
const EMPTY_HORSE: HorseForm = { name: '', breed: '', age: '', color: '', ownerId: '' };

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export interface HorseOwnerRegistryProps {
  /** localStorage key prefix. Defaults to "hippology". */
  storageKey?: string;
}

/**
 * Stores and manages owners and their horses.
 * Data is saved to localStorage so it survives page reloads.
 */
export default function HorseOwnerRegistry({ storageKey = 'hippology' }: HorseOwnerRegistryProps) {
  const [owners, setOwners] = useLocalStorage<Owner[]>(`${storageKey}:owners`, []);
  const [horses, setHorses] = useLocalStorage<Horse[]>(`${storageKey}:horses`, []);

  const [ownerForm, setOwnerForm] = useState<OwnerForm>(EMPTY_OWNER);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [horseForm, setHorseForm] = useState<HorseForm>(EMPTY_HORSE);
  const [editingHorseId, setEditingHorseId] = useState<string | null>(null);
  const [filterOwnerId, setFilterOwnerId] = useState<OwnerFilter>('all');

  const ownerName = (id: string | null): string =>
    owners.find((o) => o.id === id)?.name ?? 'Unassigned';

  // ---- Owners ----
  const resetOwnerForm = () => {
    setOwnerForm(EMPTY_OWNER);
    setEditingOwnerId(null);
  };

  const submitOwner = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const owner: OwnerForm = { ...ownerForm, name: ownerForm.name.trim() };
    if (!owner.name) return;

    if (editingOwnerId) {
      setOwners((list) => list.map((o) => (o.id === editingOwnerId ? { ...o, ...owner } : o)));
    } else {
      setOwners((list) => [...list, { id: newId(), ...owner }]);
    }
    resetOwnerForm();
  };

  const editOwner = (owner: Owner) => {
    setEditingOwnerId(owner.id);
    setOwnerForm({ name: owner.name, phone: owner.phone, email: owner.email });
  };

  const deleteOwner = (id: string) => {
    setOwners((list) => list.filter((o) => o.id !== id));
    // Keep the horses, but mark them as having no owner.
    setHorses((list) => list.map((h) => (h.ownerId === id ? { ...h, ownerId: null } : h)));
    if (filterOwnerId === id) setFilterOwnerId('all');
    if (editingOwnerId === id) resetOwnerForm();
  };

  // ---- Horses ----
  const resetHorseForm = () => {
    setHorseForm(EMPTY_HORSE);
    setEditingHorseId(null);
  };

  const submitHorse = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = horseForm.name.trim();
    if (!name) return;

    const horse: Omit<Horse, 'id'> = {
      name,
      breed: horseForm.breed,
      age: horseForm.age === '' ? null : Number(horseForm.age),
      color: horseForm.color,
      ownerId: horseForm.ownerId || null,
    };

    if (editingHorseId) {
      setHorses((list) => list.map((h) => (h.id === editingHorseId ? { ...h, ...horse } : h)));
    } else {
      setHorses((list) => [...list, { id: newId(), ...horse }]);
    }
    resetHorseForm();
  };

  const editHorse = (horse: Horse) => {
    setEditingHorseId(horse.id);
    setHorseForm({
      name: horse.name,
      breed: horse.breed,
      age: horse.age === null ? '' : String(horse.age),
      color: horse.color,
      ownerId: horse.ownerId ?? '',
    });
  };

  const deleteHorse = (id: string) => {
    setHorses((list) => list.filter((h) => h.id !== id));
    if (editingHorseId === id) resetHorseForm();
  };

  const visibleHorses: Horse[] =
    filterOwnerId === 'all'
      ? horses
      : horses.filter((h) => (filterOwnerId === 'none' ? !h.ownerId : h.ownerId === filterOwnerId));

  const field =
    <F,>(setter: Dispatch<SetStateAction<F>>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setter((f) => ({ ...f, [name]: value }));
    };

  return (
    <div className="registry">
      <h1>Horse &amp; Owner Registry</h1>

      <div className="registry-grid">
        {/* Owners */}
        <section aria-labelledby="owners-heading">
          <h2 id="owners-heading">Owners ({owners.length})</h2>

          <form onSubmit={submitOwner} aria-label="Owner form">
            <label>
              Owner name
              <input name="name" value={ownerForm.name} onChange={field(setOwnerForm)} required />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" value={ownerForm.phone} onChange={field(setOwnerForm)} />
            </label>
            <label>
              Email
              <input name="email" type="email" value={ownerForm.email} onChange={field(setOwnerForm)} />
            </label>
            <div className="actions">
              <button type="submit">{editingOwnerId ? 'Save owner' : 'Add owner'}</button>
              {editingOwnerId && (
                <button type="button" onClick={resetOwnerForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {owners.length === 0 ? (
            <p className="empty">No owners yet.</p>
          ) : (
            <ul className="list" aria-label="Owners">
              {owners.map((o) => {
                const count = horses.filter((h) => h.ownerId === o.id).length;
                return (
                  <li key={o.id}>
                    <div>
                      <strong>{o.name}</strong>
                      <span className="meta">
                        {[o.phone, o.email].filter(Boolean).join(' · ')} ({count}{' '}
                        {count === 1 ? 'horse' : 'horses'})
                      </span>
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => editOwner(o)} aria-label={`Edit ${o.name}`}>
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteOwner(o.id)} aria-label={`Delete ${o.name}`}>
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Horses */}
        <section aria-labelledby="horses-heading">
          <h2 id="horses-heading">Horses ({horses.length})</h2>

          <form onSubmit={submitHorse} aria-label="Horse form">
            <label>
              Horse name
              <input name="name" value={horseForm.name} onChange={field(setHorseForm)} required />
            </label>
            <label>
              Breed
              <input name="breed" value={horseForm.breed} onChange={field(setHorseForm)} />
            </label>
            <label>
              Age
              <input name="age" type="number" min="0" value={horseForm.age} onChange={field(setHorseForm)} />
            </label>
            <label>
              Color
              <input name="color" value={horseForm.color} onChange={field(setHorseForm)} />
            </label>
            <label>
              Owner
              <select name="ownerId" value={horseForm.ownerId} onChange={field(setHorseForm)}>
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="actions">
              <button type="submit">{editingHorseId ? 'Save horse' : 'Add horse'}</button>
              {editingHorseId && (
                <button type="button" onClick={resetHorseForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <label className="filter">
            Show horses for
            <select value={filterOwnerId} onChange={(e) => setFilterOwnerId(e.target.value)}>
              <option value="all">All owners</option>
              <option value="none">Unassigned</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>

          {visibleHorses.length === 0 ? (
            <p className="empty">No horses to show.</p>
          ) : (
            <ul className="list" aria-label="Horses">
              {visibleHorses.map((h) => (
                <li key={h.id}>
                  <div>
                    <strong>{h.name}</strong>
                    <span className="meta">
                      {[h.breed, h.color, h.age !== null ? `${h.age} yrs` : null].filter(Boolean).join(' · ')}
                    </span>
                    <span className="meta">Owner: {ownerName(h.ownerId)}</span>
                  </div>
                  <div className="actions">
                    <button type="button" onClick={() => editHorse(h)} aria-label={`Edit ${h.name}`}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteHorse(h.id)} aria-label={`Delete ${h.name}`}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
