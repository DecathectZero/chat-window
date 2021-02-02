import React from 'react';
import {Box, Flex, Heading, Text} from 'theme-ui';
import {motion} from 'framer-motion';
import ChatMessage from '../ChatMessage';
import ChatFooter from '../ChatFooter';
import AgentAvailability from '../AgentAvailability';
import CloseIcon from '../CloseIcon';

import {Message, setupPostMessageHandlers} from '../../helpers/utils';

import {isCustomerMessage} from './utils';
import {addVisibilityEventListener} from '../../helpers/visibility';

type Props = {
  accountId: string;
  customerId?: string;
  title?: string;
  subtitle?: string;
  baseUrl?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  emailInputPlaceholder?: string;
  newMessagesNotificationText?: string;
  shouldRequireEmail?: boolean;
  isMobile?: boolean;
  companyName?: string;
  isCloseable?: boolean;
  version?: string;
};

const Voiceflow: React.FC<Props> = ({
  isMobile,
  title,
  subtitle,
  companyName,
  newMessagePlaceholder,
  emailInputPlaceholder,
  shouldRequireEmail,
  isCloseable,
}) => {
  const subscriptions = React.useRef<Array<() => void>>([]);
  const scrollToEl = React.useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<Message>>([]);

  const emit = React.useCallback((event: string, payload?: any) => {
    parent.postMessage({event, payload}, '*'); // TODO: remove?
  }, []);

  const scrollIntoView = React.useCallback(() => {
    scrollToEl && scrollToEl.current.scrollIntoView(false);
  }, []);

  const postMessageHandlers = (msg: any) => {
    const {event, payload = {}} = msg.data;

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
  }, [isOpen]);

  // mount and unmount
  React.useEffect(() => {
    const win = window as any;
    subscriptions.current = [
      setupPostMessageHandlers(win, postMessageHandlers),
    ];

    return () => {
      subscriptions.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

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
      <Box sx={{bg: 'primary', position: 'relative'}}>
        <Box pt={3} pb={16} px={20}>
          {/* TODO: wrap in a button element */}
          {isCloseable && (
            <CloseIcon
              className="CloseIcon"
              width={24}
              height={24}
              onClick={() => emit('papercups:close', {})}
            />
          )}
          <Heading
            as="h2"
            className="Papercups-heading"
            sx={{color: 'background', my: 1, mr: 12}}
          >
            {title}
          </Heading>
          <Text sx={{color: 'offset'}}>{subtitle}</Text>
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
              initial={{opacity: 0, x: isMe ? 2 : -2}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.2, ease: 'easeIn'}}
            >
              <ChatMessage
                key={key}
                message={msg}
                isMe={isMe}
                companyName={companyName}
                shouldDisplayTimestamp={shouldDisplayTimestamp}
              />
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
        <ChatFooter
          key={isOpen ? 1 : 0}
          placeholder={newMessagePlaceholder}
          emailInputPlaceholder={emailInputPlaceholder}
          isSending={isSending}
          shouldRequireEmail={shouldAskForEmail}
          onSendMessage={handleSendMessage}
        />
      </Box>
    </Flex>
  );
};

export default Voiceflow;
