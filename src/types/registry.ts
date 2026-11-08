export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Horse {
  id: string;
  name: string;
  breed: string;
  /** Age in years, or null when unknown. */
  age: number | null;
  color: string;
  /** Owner id, or null when the horse has no owner. */
  ownerId: string | null;
}
