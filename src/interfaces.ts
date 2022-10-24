import { FetchTypes, OrderTypes } from "./enums";

type Value = string | boolean | number | null

export interface Where {
  conditions: string | Array<string>
  // TODO: enable named parameters Record<string, Value>
  params?: (Value)[]
}

export interface SelectOne {
  tableName: string
  fields: string | Array<string>
  where?: Where
  groupBy?: string | Array<string>
  having?: string
  orderBy?: string | Array<string> | Record<string, string | OrderTypes>
  offset?: number
}

export interface SelectAll extends SelectOne{
  limit?: number
}

export type SingleRow = {
  data: Record<string, Value>
};
export type MultipleRows = {
  columns: string[],
  rows: Value[][]
};
export type SingleOrMultiple = SingleRow | MultipleRows

export type Insert = SingleOrMultiple & {
    tableName: string
    returning?: string | Array<string>
}

export interface Update{
    tableName: string
    data: Record<string, Value>
    where: Where
    returning?: string | Array<string>
}

export interface Delete{
    tableName: string
    where: Where
    returning?: string | Array<string>
}

export interface Params{
    query: string,
    arguments?: (string | number | boolean | null)[],
    fetchType?: FetchTypes
};

export interface Meta extends Params{
    db_duration: number,
    worker_duration: number,
    served_by: string
}

export interface Result{
    changes?: number
    duration: number
    lastRowId?: number
    results?: Array<Record<string, Value>>
    served_by: string
    success: boolean
    meta: Meta
}

export interface ResultOne{
    changes?: number
    duration: number
    lastRowId?: number
    results?: Record<string, Value>
    served_by: string
    success: boolean
    meta: Meta
}
