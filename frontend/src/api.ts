import { Film, FilmsResponse } from './types';

const API_BASE = '/api';

export async function fetchFilms(params: {
  status?: string;
  search?: string;
  sort?: string;
}): Promise<FilmsResponse> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);

  const res = await fetch(`${API_BASE}/films?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch films');
  return res.json();
}

export async function createFilm(data: {
  title: string;
  year?: number | null;
  url?: string;
  status?: string;
  rating?: number;
  comment?: string;
}): Promise<Film> {
  const res = await fetch(`${API_BASE}/films`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create film');
  }
  return res.json();
}

export async function updateFilm(
  id: number,
  data: {
    title: string;
    year?: number | null;
    url?: string;
    status?: string;
    rating?: number;
    comment?: string;
  }
): Promise<Film> {
  const res = await fetch(`${API_BASE}/films/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update film');
  }
  return res.json();
}

export async function deleteFilm(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/films/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete film');
}

export async function updateFilmStatus(id: number, status: string): Promise<Film> {
  const res = await fetch(`${API_BASE}/films/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function updateFilmRating(id: number, rating: number): Promise<Film> {
  const res = await fetch(`${API_BASE}/films/${id}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error('Failed to update rating');
  return res.json();
}

export async function fetchRandomFilm(status: string = 'plan'): Promise<Film | null> {
  const res = await fetch(`${API_BASE}/films/random?status=${status}`);
  if (!res.ok) throw new Error('Failed to fetch random film');
  const data = await res.json();
  return data.film || null;
}

export function getExportUrl(type: 'csv' | 'json'): string {
  return `${API_BASE}/export/${type}`;
}
