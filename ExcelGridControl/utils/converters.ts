import { Cell } from '../types';

export function jsonTo2DArray<T extends Record<string, any>>(data: T[]): string[][] {
  if (data.length === 0) return [];

  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => String(obj[header])));

  return [headers, ...rows];
}

export function twoDArrayToJson<T = Record<Cell, Cell>>(data: Cell[][]): T[] {
  if (data.length < 2) return [];

  const [headers, ...rows] = data;

  return rows.map(row =>
    headers.reduce((obj: any, header: any, i) => {
      let key = header?.trim();
      if (!key) {
        key = `Header${i + 1}`;
      }
      while (key in obj) {
        key = key + (i + 1);
      }
      obj[key] = row[i] ?? "";
      return obj;
    }, {} as T)
  );
}