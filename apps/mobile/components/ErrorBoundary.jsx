import { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={this.resetError}
            style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
