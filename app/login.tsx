import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../lib/auth';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../constants/DesignTokens';
import { router } from 'expo-router';
import ClayCard from '../components/ui/ClayCard';
import ClayButton from '../components/ui/ClayButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      setError('Check your email for the confirmation link!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Table Talk</Text>
      <Text style={styles.tagline}>Scheduling for tabletop adventurers.</Text>

      <ClayCard variant="base" style={styles.card}>
        <Text style={styles.cardTitle}>Organizer Sign In</Text>
        <Text style={styles.cardSubtitle}>Log in to manage your campaigns and sessions.</Text>

        <View style={{ height: Spacing.lg }} />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.periwinkleLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { marginTop: Spacing.sm }]}
          placeholder="Password"
          placeholderTextColor={Colors.periwinkleLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ height: Spacing.lg }} />
        <ClayButton label="Sign In" variant="primary" onPress={handleSignIn} loading={loading} fullWidth />
        <View style={{ height: Spacing.sm }} />
        <ClayButton label="Create Account" variant="secondary" onPress={handleSignUp} loading={loading} fullWidth />
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  appTitle: {
    fontFamily: FontFamily.extrabold,
    fontSize: 40,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.subheading,
    color: Colors.ink,
    opacity: 0.6,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.heading,
    color: Colors.ink,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
    opacity: 0.6,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.mist,
    padding: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body,
    color: Colors.ink,
  },
  error: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.label,
    color: Colors.urgent,
  },
});
