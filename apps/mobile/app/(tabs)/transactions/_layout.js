import { Stack } from 'expo-router';
import { TransactionsProvider} from '../../../contexts/TransactionsContext'

export default function TransactionsLayout() {
  return (
  <TransactionsProvider>
    <Stack 
      screenOptions={{
          headerShown: false
      }}
    />
  </TransactionsProvider>
    );
}