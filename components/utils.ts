import { Message } from '../helpers/types';

export const isCustomerMessage = (message: Message): boolean => !!(message.sent_at && message.type === 'customer');

export const getCurrentTime = () => new Date().toISOString();
