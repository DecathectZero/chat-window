import { Message } from '../helpers/utils';

export const isCustomerMessage = (message: Message): boolean => !!(message.sent_at && message.type === 'customer');

export const getCurrentTime = () => new Date().toISOString();
