import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, List, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { trpc } from '@/services/trpc';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const { data: profile, isLoading } = trpc.auth.me.useQuery();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Account Information" />
        <Card.Content>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <List.Item
                title="Name"
                description={profile?.name}
                left={(props) => <List.Icon {...props} icon="account" />}
              />
              <Divider />
              <List.Item
                title="Email"
                description={profile?.email}
                left={(props) => <List.Icon {...props} icon="email" />}
              />
              <Divider />
              <List.Item
                title="Email Verified"
                description={profile?.isEmailVerified ? 'Yes' : 'No'}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={profile?.isEmailVerified ? 'check-circle' : 'alert-circle'}
                  />
                )}
              />
              {profile?.age && (
                <>
                  <Divider />
                  <List.Item
                    title="Age"
                    description={profile.age.toString()}
                    left={(props) => <List.Icon {...props} icon="cake" />}
                  />
                </>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Actions" />
        <Card.Actions>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Back
          </Button>
          <Button mode="contained" onPress={handleLogout}>
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6200ee',
  },
  title: {
    color: 'white',
  },
  card: {
    margin: 16,
  },
});
