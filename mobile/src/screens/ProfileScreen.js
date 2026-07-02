import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, updateUserProfile } from '../api/user';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState('Basic');

  useEffect(() => {
    (async () => {
      const result = await getUserProfile();
      const profile = result.success ? result.data : user;
      setName(profile?.name || '');
      setEmail(profile?.email || '');
      setPhone(profile?.phone || '');
      setLocation(profile?.location || '');
      setPlan(profile?.plan || 'Basic');
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateUserProfile({ name, email, phone, location });
    setSaving(false);
    if (result.success) {
      setEditing(false);
      refreshAuth();
    } else {
      Alert.alert('Error', result.message || 'Could not update profile');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.nameText}>{name || 'User'}</Text>
        <Text style={styles.emailText}>{email}</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{plan} Plan</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Info</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'pencil'} size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={name}
          onChangeText={setName}
          editable={editing}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={email}
          onChangeText={setEmail}
          editable={editing}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={phone}
          onChangeText={setPhone}
          editable={editing}
          placeholder="Not set"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputDisabled]}
          value={location}
          onChangeText={setLocation}
          editable={editing}
          placeholder="Not set"
          placeholderTextColor={colors.textMuted}
        />

        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  container: { padding: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '700' },
  nameText: { fontSize: 18, fontWeight: '700', color: colors.text },
  emailText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  planBadge: { backgroundColor: '#DBEAFE', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  planText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text,
  },
  inputDisabled: { backgroundColor: colors.bg, color: colors.textMuted },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  logoutButton: {
    flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.error, borderRadius: 10, paddingVertical: 14, marginTop: 6,
  },
  logoutText: { color: colors.error, fontWeight: '600', fontSize: 14 },
});
