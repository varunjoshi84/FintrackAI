import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadStatement } from '../api/dashboard';
import { colors } from '../theme/colors';

export default function UploadScreen({ navigation }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setFile(result.assets[0]);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('');
    const result = await uploadStatement(file.uri, file.name, file.mimeType || 'application/octet-stream');
    setUploading(false);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus(result.message || 'Upload failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="document-attach-outline" size={48} color={colors.primary} />
        <Text style={styles.title}>Upload Bank Statement</Text>
        <Text style={styles.subtitle}>PDF or CSV — we'll analyze it automatically</Text>

        <TouchableOpacity style={styles.pickButton} onPress={pickFile}>
          <Text style={styles.pickButtonText}>
            {file ? file.name : 'Choose File'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, (!file || uploading) && styles.buttonDisabled]}
          onPress={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.uploadButtonText}>Upload &amp; Analyze</Text>
          )}
        </TouchableOpacity>

        {status === 'success' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Uploaded successfully!</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Text style={styles.linkText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
        {status && status !== 'success' && (
          <Text style={styles.errorText}>{status}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 24, alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 20, textAlign: 'center' },
  pickButton: {
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 10,
    paddingVertical: 16, paddingHorizontal: 20, width: '100%', alignItems: 'center', marginBottom: 16,
  },
  pickButtonText: { color: colors.text, fontSize: 13 },
  uploadButton: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, width: '100%', alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  uploadButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  successBox: { marginTop: 16, alignItems: 'center' },
  successText: { color: colors.success, fontWeight: '600', marginBottom: 6 },
  linkText: { color: colors.primary, fontWeight: '600' },
  errorText: { color: colors.error, marginTop: 14, fontSize: 13, textAlign: 'center' },
});
