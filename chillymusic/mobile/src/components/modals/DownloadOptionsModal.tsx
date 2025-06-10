import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { DefaultTheme, Spacing, Typography, BorderRadius } from '../../theme/theme';
import { MediaFormatDetails, MediaInfo } from '../../types';
import Icon from '../ui/Icon';

// Define a user-friendly download option structure
export interface DownloadOption {
  label: string; // e.g., "MP3 - 128kbps", "MP4 - 720p"
  format: 'mp3' | 'mp4';
  quality: string; // e.g., "128kbps", "720p", or a format_id if specific
  formatDetails?: MediaFormatDetails; // Optional: original format details
}

interface DownloadOptionsModalProps {
  visible: boolean;
  mediaInfo: MediaInfo | null; // Pass the full mediaInfo
  isLoading: boolean;
  onClose: () => void;
  onSelectOption: (option: DownloadOption) => void;
}

// Helper to derive user-friendly download options from MediaInfo.formats
const generateDownloadOptions = (mediaInfo: MediaInfo | null): DownloadOption[] => {
  if (!mediaInfo?.formats) return [];

  const options: DownloadOption[] = [];
  const addedQualities: { [key: string]: boolean } = {};

  // Audio options (MP3 target)
  const audioFormats = mediaInfo.formats
    .filter(f => f.audioCodec && f.audioCodec !== 'none' && (!f.videoCodec || f.videoCodec === 'none'))
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  if (audioFormats.length > 0) {
    const bestAudio = audioFormats[0]; // Simplification: use the best available audio as a base
    if (bestAudio.abr && bestAudio.abr >= 256) { // Example threshold for "High"
       options.push({ label: `MP3 - High (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '320kbps', formatDetails: bestAudio });
    }
    if (bestAudio.abr && bestAudio.abr >= 190) { // Example threshold for "Medium"
       options.push({ label: `MP3 - Medium (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '192kbps', formatDetails: bestAudio });
    }
    // Always offer a standard option
    options.push({ label: `MP3 - Standard (~${bestAudio.abr ? Math.round(bestAudio.abr) : 128}kbps)`, format: 'mp3', quality: '128kbps', formatDetails: bestAudio });
  } else {
     // Fallback if no suitable audio-only formats are found (less ideal)
     options.push({ label: 'MP3 - 128kbps', format: 'mp3', quality: '128kbps' });
  }

  // Video options (MP4 target)
  const targetVideoQualitiesMap: Record<string, {height: number; label: string}> = {
      '360p': {height: 360, label: 'SD 360p'},
      '720p': {height: 720, label: 'HD 720p'},
      '1080p': {height: 1080, label: 'Full HD 1080p'},
  };

  Object.entries(targetVideoQualitiesMap).forEach(([qualityKey, qualityValue]) => {
    const foundFormat = mediaInfo.formats.find(
      f => f.ext === 'mp4' && f.height === qualityValue.height && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none'
    );
    const label = `MP4 - ${qualityValue.label}`;
    if (!addedQualities[label]) { // Avoid duplicate labels
        if (foundFormat) {
            options.push({ label, format: 'mp4', quality: qualityKey, formatDetails: foundFormat });
        } else {
            // Offer the option even if not directly found; backend yt-dlp will try its best
            options.push({ label, format: 'mp4', quality: qualityKey });
        }
        addedQualities[label] = true;
    }
  });

  // Remove duplicates by label (additional safety, though logic above tries to prevent it)
  return options.filter((option, index, self) =>
    index === self.findIndex((o) => o.label === option.label)
  ).sort((a,b) => { // Sort for consistent order: MP3s first, then MP4s by quality
      if (a.format === 'mp3' && b.format === 'mp4') return -1;
      if (a.format === 'mp4' && b.format === 'mp3') return 1;
      // Further sort by quality if needed, e.g. based on predefined order or filesize/bitrate
      return 0;
  });
};


const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  visible,
  mediaInfo,
  isLoading,
  onClose,
  onSelectOption,
}) => {
  const downloadOptions = React.useMemo(() => generateDownloadOptions(mediaInfo), [mediaInfo]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Download Options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="Close" size={24} color={DefaultTheme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator size="large" color={DefaultTheme.colors.accentPrimary} style={styles.loader} />}

          {!isLoading && downloadOptions.length === 0 && (
            <Text style={styles.emptyText}>No download options available or error fetching them.</Text>
          )}

          {!isLoading && downloadOptions.length > 0 && (
            <FlatList
              data={downloadOptions}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionButton} onPress={() => onSelectOption(item)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.formatDetails?.filesize ? (
                    <Text style={styles.optionDetailText}>
                      (~{(item.formatDetails.filesize / 1024 / 1024).toFixed(1)} MB)
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: Spacing.md,
    backgroundColor: DefaultTheme.colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'stretch', // Stretch items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h1,
    fontWeight: 'bold',
    color: DefaultTheme.colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.body,
    color: DefaultTheme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  optionButton: {
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: Typography.fontSize.bodyLarge,
    color: DefaultTheme.colors.textPrimary,
  },
  optionDetailText: {
    fontSize: Typography.fontSize.body,
    color: DefaultTheme.colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: DefaultTheme.colors.border,
  },
});

export default DownloadOptionsModal;
