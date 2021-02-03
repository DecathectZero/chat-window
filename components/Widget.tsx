import React from 'react';
import { ThemeProvider } from 'theme-ui';
import ChatWindow from './ChatWindow';
import { isDev } from '../helpers/config';
import { setupPostMessageHandlers } from '../helpers/utils';
import getThemeConfig from '../helpers/theme';
import Logger from '../helpers/logger';

type Config = {
  title?: string;
  subtitle?: string;
  avatar?: string;
  primaryColor?: string;
  versionID?: string;
  runtimeEndpoint?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  companyName?: string;
  requireEmailUpfront?: boolean;
  closeable?: boolean;
  mobile?: boolean;
  metadata?: string; // stringified CustomerMetadata JSON
  version?: string;
};

const sanitizeConfigPayload = (payload: any): Config => {
  if (!payload) {
    return {};
  }

  const { versionID, title, subtitle, primaryColor, runtimeEndpoint, greeting, companyName, newMessagePlaceholder, closeable, version } = payload;

  return {
    versionID,
    title,
    subtitle,
    primaryColor,
    runtimeEndpoint,
    greeting,
    companyName,
    newMessagePlaceholder,
    closeable,
    version,
  };
};

type Props = { config: Config };
type State = { config: Config };

class Wrapper extends React.Component<Props, State> {
  logger?: Logger;
  unsubscribe?: () => void;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
    };
  }

  componentDidMount() {
    // TODO: make it possible to opt into debug mode
    const debugModeEnabled = isDev(window);

    this.logger = new Logger(debugModeEnabled);
    this.unsubscribe = setupPostMessageHandlers(window, this.postMessageHandlers);
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  postMessageHandlers = (msg: any) => {
    this.logger?.debug('Handling in wrapper:', msg.data);
    const { event, payload = {} } = msg.data;

    switch (event) {
      case 'config:update':
        return this.handleConfigUpdate(payload);
      default:
        return null;
    }
  };

  handleConfigUpdate = (payload: any) => {
    const updates = sanitizeConfigPayload(payload);
    this.logger?.debug('Updating widget config:', updates);

    this.setState({ config: { ...this.state.config, ...updates } });
  };

  render() {
    const { config = {} } = this.state;

    if (Object.keys(config).length === 0) {
      return null;
    }

    const {
      versionID,
      greeting,
      companyName,
      title = 'Welcome!',
      subtitle = 'How can we help you?',
      newMessagePlaceholder = 'Start typing...',
      primaryColor = '1890ff',
      runtimeEndpoint = '',
      closeable = '1',
      mobile = '0',
      version = '1.0.0',
    } = config;

    const isMobile = !!Number(mobile);
    const isCloseable = !!Number(closeable);
    const theme = getThemeConfig({ primary: primaryColor });

    return (
      <ThemeProvider theme={theme}>
        <ChatWindow
          title={title}
          subtitle={subtitle}
          versionID={versionID!}
          greeting={greeting}
          companyName={companyName}
          newMessagePlaceholder={newMessagePlaceholder}
          isMobile={isMobile}
          isCloseable={isCloseable}
          runtimeEndpoint={runtimeEndpoint}
          version={version}
        />
      </ThemeProvider>
    );
  }
}

export default Wrapper;
