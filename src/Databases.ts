import {QueryBuilder} from "./Builder";
import {FetchTypes} from "./enums";

type Params = { query: String, arguments?: (string | number | boolean | null)[], fetchType?: FetchTypes };
const now = typeof performance === 'undefined' ? () => Date.now() : () => performance.now()

export class D1QB extends QueryBuilder {
  private db: any;
  constructor(db: any) {
    super();
    this.db = db;
  }

  async execute(params: Params): Promise<any> {
    const prev = now()
    const result = await this._execute(params);
    return {
      ...result,
      meta: {
        ...params,
        db_duration: result.duration,
        served_by: result.served_by,
        worker_duration: now() - prev
      }
    }
  }

  async _execute(params: Params) {
    let stmt = this.db.prepare(params.query)

    if (params.arguments) {
      stmt = stmt.bind(...params.arguments)
    }

    if (params.fetchType === FetchTypes.ONE) {
      return stmt.first()
    } else if (params.fetchType === FetchTypes.ALL) {
      return stmt.all()
    }

    return stmt.run()
  }
}
