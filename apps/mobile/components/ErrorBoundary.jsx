import { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import i18n from '../i18n';

// Central error reporting hook. Currently logs locally; a remote sink (e.g.
// Sentry) can be added here without touching the boundary or its callers.
export const reportError = (error, context = {}) => {
  console.error('[ErrorBoundary]', context, error);
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, { componentStack: errorInfo?.componentStack });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center px-5 bg-background dark:bg-neutral-900">
          <Text className="text-text dark:text-white text-lg font-bold mb-2">
            {i18n.t('errorBoundary.title')}
          </Text>
          <Text className="text-subtext text-sm text-center mb-5">
            {i18n.t('errorBoundary.message')}
          </Text>
          <TouchableOpacity
            onPress={this.resetError}
            className="px-4 py-3 rounded-lg bg-primary"
          >
            <Text className="text-white font-semibold">
              {i18n.t('errorBoundary.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
