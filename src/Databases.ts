import { QueryBuilder } from './Builder'
import { FetchTypes } from './enums'
import { Params } from './interfaces'

// @ts-ignore
const now = typeof globalThis.performance === 'undefined' ? () => Date.now() : () => globalThis.performance.now()

export class D1QB extends QueryBuilder {
  private db: D1Database
  constructor(db: D1Database) {
    super()
    this.db = db
  }

  async batch(cb: (batchedDB: QueryBuilder) => Promise<any>[]): Promise<{ results: any[]; meta: any }> {
    const batchedDB = new BatchedQB()
    cb(batchedDB)
    console.log(batchedDB.queries)

    const prev = now()
    const results = await this.db.batch(
      batchedDB.queries.map((queued) => {
        return this._prepare(queued.params)
      })
    )
    const end = {
      query: 'BATCH',
      worker_duration: now() - prev,
    }
    const meta: any[] = []

    results.forEach((r, i) => {
      batchedDB.queries[i].resolve(r)
      meta.push({
        ...batchedDB.queries[i].params,
        db_duration: r.duration,
        served_by: r.served_by,
      })
    })
    meta.push(end)
    return { results, meta }
  }

  async execute(params: Params): Promise<any> {
    const prev = now()
    const result = await this._execute(params)
    const meta = {
      ...params,
      db_duration: result.duration,
      served_by: result.served_by,
      worker_duration: now() - prev,
    }
    return {
      ...result,
      meta,
    }
  }

  async _execute(params: Params) {
    const stmt = this._prepare(params)

    if (params.fetchType === FetchTypes.ONE) {
      return stmt.first()
    } else if (params.fetchType === FetchTypes.ALL) {
      return stmt.all()
    }

    return stmt.run()
  }

  private _prepare(params: Params) {
    let stmt = this.db.prepare(params.query)

    if (params.arguments) {
      stmt = stmt.bind(...params.arguments)
    }
    return stmt
  }
}

type QueuedQuery = {
  params: Params
  resolve: (value: unknown) => void
  reject: (value: unknown) => void
}

class BatchedQB extends QueryBuilder {
  queries: QueuedQuery[] = []

  async execute(params: Params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queries.push({
        params,
        resolve,
        reject,
      })
    })
  }
}
