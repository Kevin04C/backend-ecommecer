import ExpressExpeditious from 'express-expeditious';
import ExpeditiousEngineMemory from 'expeditious-engine-memory'; 

/* const defaultOptions = {
    namespace:'expresscache',
    defaultTtl:'1 minute',
    statusCodeExpires:{
        404:'5 minutes',
        500:'0'
    }
} */
export const cache = ExpressExpeditious({
    // Namespace used to prevent cache conflicts, must be alphanumeric
    namespace: 'expresscache',
    engine: ExpeditiousEngineMemory(),
    // Store cache entries for 1 minute (can also pass milliseconds e.g 60000)
    defaultTtl: '30 minutes',
    statusCodeExpires:{
        404:'5 minutes',
        500:'0'
    }
  });