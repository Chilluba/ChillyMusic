import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from '../context/ThemeContext';
import { useDownload, ActiveDownloadProgress } from '../context/DownloadContext'; // PendingDownloadItem is not exported from context, so use its structure
import Icon from '../components/ui/Icon';

// Define PendingDownloadItem locally if not exported from context, matching context's internal structure
interface PendingDownloadItemDisplay {
  track: { title: string; videoId: string; channel?: string; thumbnail?: string }; // Simplified from SearchResult | DownloadedMediaItem
  option: { format: string; quality: string };
  addedAt: number;
  downloadKey: string;
}


type DownloadsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Downloads'>;
interface Props { navigation: DownloadsScreenNavigationProp; }

const DownloadsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { activeDownloads, pendingDownloads, cancelDownload, clearCompletedOrErroredDownload } = useDownload();

  const activeList = Object.values(activeDownloads).filter(dl => dl.itemMetadata && dl.progress < 100 && !dl.error)
    .sort((a,b) => (a.itemMetadata?.title || '').localeCompare(b.itemMetadata?.title || ''));

  const completedOrErrorList = Object.values(activeDownloads).filter(dl => dl.itemMetadata && (dl.progress === 100 || !!dl.error))
    .sort((a,b) => (b.itemMetadata?.title || '').localeCompare(a.itemMetadata?.title || ''));

  // Adapt pendingDownloads to PendingDownloadItemDisplay for rendering
  const pendingList: PendingDownloadItemDisplay[] = pendingDownloads.map(p => ({
      track: { title: p.track.title, videoId: p.track.videoId, channel: 'channel' in p.track ? p.track.channel : undefined, thumbnail: p.track.thumbnail },
      option: { format: p.option.format, quality: p.option.quality },
      addedAt: p.addedAt,
      downloadKey: p.downloadKey
  })).sort((a,b) => a.addedAt - b.addedAt);


  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
    scrollViewContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
    sectionTitle: { fontSize: theme.typography.fontSize.h2, fontWeight: theme.typography.fontWeight.bold as any, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm, marginTop: theme.spacing.md, fontFamily: theme.typography.fontFamily.primary },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, marginBottom: theme.spacing.sm, borderWidth:1, borderColor: theme.colors.border },
    itemInfo: { flex: 1, marginRight: theme.spacing.sm },
    itemTitle: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textPrimary, fontWeight: '500', fontFamily: theme.typography.fontFamily.primary },
    itemSubtitle: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.primary },
    progressBarOuterLarge: { height: 8, backgroundColor: theme.colors.backgroundTertiary, borderRadius: 4, overflow: 'hidden', marginTop: theme.spacing.xs },
    progressBarInnerLarge: { height: '100%', backgroundColor: theme.colors.accentSecondary, borderRadius: 4 },
    errorText: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, marginTop: theme.spacing.xs, fontFamily: theme.typography.fontFamily.primary },
    errorTextSmall: { fontSize: theme.typography.fontSize.caption, color: theme.colors.error, marginTop: theme.spacing.xs/2, fontFamily: theme.typography.fontFamily.primary },
    actionButton: { padding: theme.spacing.sm },
    emptyListText: { textAlign: 'center', color: theme.colors.textMuted, marginVertical: theme.spacing.lg, fontSize: theme.typography.fontSize.bodyLarge, fontFamily: theme.typography.fontFamily.primary },
    itemCompletedBg: { opacity: 0.7 }, // Slight visual cue for completed
    itemErrorBg: { borderColor: theme.colors.error, opacity: 0.8 },
  });

  const renderActiveDownloadItem = ({ item }: { item: ActiveDownloadProgress }) => {
    const metadata = item.itemMetadata;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{metadata?.title || 'Unknown Track'}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {metadata?.format?.toUpperCase()} ({metadata?.quality}) - {item.progress.toFixed(0)}%
          </Text>
          <View style={styles.progressBarOuterLarge}><View style={[styles.progressBarInnerLarge, {width: `${item.progress}%`}]} /></View>
          {item.error && <Text style={styles.errorText}>Error: {item.error}</Text>}
        </View>
        <TouchableOpacity onPress={() => cancelDownload(metadata!.id)} style={styles.actionButton}>
          <Icon name="Close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPendingDownloadItem = ({ item }: { item: PendingDownloadItemDisplay }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.track.title}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.option.format.toUpperCase()} ({item.option.quality}) - Queued
          </Text>
        </View>
        <TouchableOpacity onPress={() => cancelDownload(item.downloadKey)} style={styles.actionButton}>
            <Icon name="Close" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCompletedOrErrorItem = ({ item }: { item: ActiveDownloadProgress }) => {
    const metadata = item.itemMetadata;
    return (
      <View style={[styles.itemContainer, item.error ? styles.itemErrorBg : styles.itemCompletedBg]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{metadata?.title || 'Unknown Track'}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {metadata?.format?.toUpperCase()} ({metadata?.quality}) - {item.error ? 'Failed' : 'Completed'}
          </Text>
          {item.error && <Text style={styles.errorTextSmall} numberOfLines={2}>Error: {item.error}</Text>}
        </View>
        <TouchableOpacity onPress={() => clearCompletedOrErroredDownload(metadata!.id)} style={styles.actionButton}>
          <Icon name="Close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.sectionTitle}>Active Downloads ({activeList.length})</Text>
      {activeList.length > 0 ? (
        <FlatList data={activeList} renderItem={renderActiveDownloadItem} keyExtractor={(item) => item.itemMetadata!.id} />
      ) : (
        <Text style={styles.emptyListText}>No active downloads.</Text>
      )}

      <Text style={styles.sectionTitle}>Queued ({pendingDownloads.length})</Text>
      {pendingList.length > 0 ? (
        <FlatList data={pendingList} renderItem={renderPendingDownloadItem} keyExtractor={(item) => item.downloadKey} />
      ) : (
        <Text style={styles.emptyListText}>Download queue is empty.</Text>
      )}

      <Text style={styles.sectionTitle}>History ({completedOrErrorList.length})</Text>
      {completedOrErrorList.length > 0 ? (
        <FlatList data={completedOrErrorList} renderItem={renderCompletedOrErrorItem} keyExtractor={(item) => item.itemMetadata!.id} />
      ) : (
        <Text style={styles.emptyListText}>No recent completed or failed downloads.</Text>
      )}
    </ScrollView>
  );
};

export default DownloadsScreen;
