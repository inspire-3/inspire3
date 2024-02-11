type timestamp = number; // milliseconds since 1970

export interface IContentSource {
  type: 'url' | 'cid' | 'ai_workflow' | 'prompt',
  ref: string,
};

export interface IArtifactRef {
  service: 'icp' | 'filecoin',
  type: '_all' | 'meta' | 'embedding-m2-*' | 'source' | 'index' | 'markdown' | 'fullpageshot',
  filename: string, // meta.json, embeddings-m2-*.json, source.html, index.html, index.md, pageshot.png
  ref: string, // case: FileCoin -> FileCoin CID, case: ICP -> url
};

export interface IContentDescribers {
  tempCid: string, // 'crypto.getRandomValues()', // used as reference until all information are collected
  type: 'source' | 'derived', // source means collect and derived from... already collected sources
  activityId: string,
  jobId: string,

  consumption: {
    timeInS: number, // time in milliseconds
    strategy: string, // used to calc differences between methods
  },

  sources: IContentSource[],

  title?: string,
  slug?: string,
  description?: string,
  image?: {
    url: string,
    alt?: string,
  },
  keywordIds: string[],
  published: 'unkown' | timestamp, // publishing date of source

  collected: string | null, // 'timestamp|nulll'
  cPiid: string, // collectorPiid // piid 'ProxyIdentityId',
  oPiid?: string, // ownerPiid  'ProxyIdentityId', // ownership can be claimed from
  previousVersion?: string, // cid  interesting when infromation behind a URL change

  artifacts: IArtifactRef[],
}
