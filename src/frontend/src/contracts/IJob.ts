type timestamp = number; // milliseconds since 1970

export interface IErrorEntry {
  timestamp: timestamp,
  message: string,
  processId: string,
  run: number, /* current run */
}

export interface ILogEntry {
  timestamp: timestamp,
  action: string,
  message: string,
  processId: string,
  run: int,  /* current run */
}

export interface IJob {
  workflow: string, // name of the workflow e.g. 'retrieve-information-from-a-url-v1'
  processId: string, // is generated for each worker run also when in retry-mode
  activityId: string,
  activityType: string,
  tempCid: string,

  progress: {
    currentStep: number,
    stepsCount: number, // depends on the workflow
    updated: timestamp,
  },

  job_artifacts: IArtifactRef[],

  runs: 0, // starts from 0 at job creation
  maxRuns: 2, // defined at job creation, when reached data.runs > data.maxRuns -> failed

  logs: ILogEntry[], // can be used to track progress of sub queue jobs

  errors: IErrorEntry[],

  version: 0, // used for read then write pattern to ensure that nothing is untinentinally overwritten
  // job_artifacts only use key and description from juno Doc
};
