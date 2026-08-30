import { SITE } from './constants';
export function assertPaymentsEnabled(){if(!SITE.paymentsEnabled)throw new Error('Donations are temporarily unavailable.');}
