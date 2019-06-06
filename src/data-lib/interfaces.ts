import { Value as JSONValue } from 'json-typescript';

export type Dict<K extends string, V> = { [KK in K]: V };

export interface Request {
  url?: string;
  params?: Dict<string, JSONValue>;
}

export interface Response {
  content: {
    data: JSONValue;
  };
}

export type NextFn = (r: Request) => Promise<Response>;

export interface Middleware {
  request(request: Request, next: NextFn): Promise<Response>;
}

export interface RecordIdentifier {
  type: string;
  id: string | null;
  lid: string;
}

export interface UserRecord extends RecordIdentifier {
  type: 'user';

  // some properties
  firstName: string | null;
  lastName: string | null;
  username: string | null;

  // some related records
  friends: RecordIdentifier[];
}
