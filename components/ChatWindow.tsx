import React from 'react';
import { Box, Flex, Heading, Text } from 'theme-ui';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ChatFooter from './ChatFooter';
import CloseIcon from './CloseIcon';
import App from '@voiceflow/runtime-client-js';
import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { Message, setupPostMessageHandlers } from '../helpers/utils';

import { isCustomerMessage, getCurrentTime } from './utils';

type Props = {
  versionID: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  runtimeEndpoint?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  isMobile?: boolean;
  companyName?: string;
  isCloseable?: boolean;
  version?: string;
};

const Voiceflow: React.FC<Props> = ({
  isMobile,
  title,
  avatar,
  subtitle,
  companyName,
  versionID,
  newMessagePlaceholder,
  runtimeEndpoint,
  isCloseable,
}) => {
  const subscriptions = React.useRef<Array<() => void>>([]);
  const scrollToEl = React.useRef<HTMLDivElement>(null);
  const chatbot = React.useMemo(() => new App({ versionID, endpoint: runtimeEndpoint }), []);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<Message>>([]);

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message]);
  };

  const addTraceMessages = (traces: Array<GeneralTrace>) => {
    traces.forEach((trace) => {
      if (trace.type === TraceType.SPEAK) {
        const message: Message = {
          body: trace.payload.message,
          created_at: getCurrentTime(),
          type: 'bot',
          user: {
            id: 0,
            email: '',
            profile_photo_url: avatar,
          },
        };
        addMessage(message);
      }
    });
  };

  const initializeState = async () => {
    const context = await chatbot.start();
    addTraceMessages(context.getResponse());
  };

  const emit = React.useCallback((event: string, payload?: any) => {
    parent.postMessage({ event, payload }, '*'); // TODO: remove?
  }, []);

  const scrollIntoView = React.useCallback(() => {
    scrollToEl.current?.scrollIntoView(false);
  }, []);

  const postMessageHandlers = (msg: any) => {
    const { event, payload = {} } = msg.data;

    switch (event) {
      case 'papercups:toggle':
        setIsOpen(!!payload.isOpen);
        return;
      default:
        return null;
    }
  };

  React.useEffect(() => {
    if (isOpen) scrollIntoView();
  }, [isOpen, messages]);

  // mount and unmount
  React.useEffect(() => {
    initializeState();

    const win = window as any;
    subscriptions.current = [setupPostMessageHandlers(win, postMessageHandlers)];

    return () => {
      subscriptions.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    if (isSending || !message || message.trim().length === 0) {
      return;
    }
    setIsSending(true);

    addMessage({
      body: message,
      type: 'customer',
      sent_at: getCurrentTime(),
    });
    const context = await chatbot.sendText(message);
    addTraceMessages(context.getResponse());

    // if ending, just restart the conversation again
    if (context.isEnding()) {
      await initializeState();
    }

    setIsSending(false);
  };

  return (
    <Flex
      className={isMobile ? 'Mobile' : ''}
      sx={{
        bg: 'background',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        flex: 1,
      }}
    >
      <Box sx={{ bg: 'primary', position: 'relative' }}>
        <Box pt={3} pb={16} px={20}>
          {/* TODO: wrap in a button element */}
          {isCloseable && <CloseIcon className="CloseIcon" width={24} height={24} onClick={() => emit('papercups:close', {})} />}
          <Heading as="h2" className="Papercups-heading" sx={{ color: 'background', my: 1, mr: 12 }}>
            {title}
          </Heading>
          <Text sx={{ color: 'offset' }}>{subtitle}</Text>
        </Box>
      </Box>

      <Box
        p={3}
        sx={{
          flex: 1,
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 21px 4px -20px inset',
          overflowY: 'scroll',
        }}
      >
        {messages.map((msg, key) => {
          const shouldDisplayTimestamp = key === messages.length - 1;
          const isMe = isCustomerMessage(msg);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: isMe ? 2 : -2 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeIn' }}
            >
              <ChatMessage key={key} message={msg} isMe={isMe} companyName={companyName} shouldDisplayTimestamp={shouldDisplayTimestamp} />
            </motion.div>
          );
        })}
        <div ref={scrollToEl} />
      </Box>
      <Box
        px={2}
        sx={{
          borderTop: '1px solid rgb(230, 230, 230)',
          // TODO: only show shadow on focus TextArea below
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 100px 0px',
        }}
      >
        {/*
          NB: we use a `key` prop here to force re-render on open so
          that the input will auto-focus appropriately
        */}
        <ChatFooter key={isOpen ? 1 : 0} placeholder={newMessagePlaceholder} isSending={isSending} onSendMessage={handleSendMessage} />
      </Box>
    </Flex>
  );
};

export default Voiceflow;
