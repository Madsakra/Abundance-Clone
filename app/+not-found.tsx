import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import React from 'react';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
   
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/sign-in" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
   
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
