export const environmentResolver = () => {
  return {
    environment: process.env?.APP_ENV ?? 'local',
    product: process.env?.PRODUCT ?? 'app',
    version: {
      commit: process.env?.CI_COMMIT_SHA ?? null,
      deployedAt: process.env?.DEPLOYMENT_TIMESTAMP ?? 0
    },
    cicd: {
      mergeRequestId: process.env?.CI_MERGE_REQUEST_IID ?? null,
      pipelineId: process.env?.CI_PIPELINE_ID ?? null,
      pipelineUrl: process.env?.CI_PIPELINE_URL ?? null
    },
    services: {
      fathom: {
        isEnabled: process.env?.SERVICE_FATHOM_IS_ENABLED ?? false,
        siteId: process.env?.SERVICE_FATHOM_SITE_ID ?? null,
        url: process.env?.SERVICE_FATHOM_URL ?? null
      }
    }
  }
}
