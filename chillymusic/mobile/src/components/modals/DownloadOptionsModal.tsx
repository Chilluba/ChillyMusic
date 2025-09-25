import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { MediaInfo, MediaFormatDetails } from '../../types'; // Ensure MediaFormatDetails is imported
import Icon from '../ui/Icon';

// Define a user-friendly download option structure
export interface DownloadOption {
  label: string;
  format: 'mp3' | 'mp4';
  quality: string;
  formatDetails?: MediaFormatDetails;
}

interface DownloadOptionsModalProps {
  visible: boolean;
  mediaInfo: MediaInfo | null;
  isLoading: boolean;
  onClose: () => void;
  onSelectOption: (option: DownloadOption) => void;
}

// Using the more complete generateDownloadOptions from subtask 18
const generateDownloadOptions = (mediaInfo: MediaInfo | null): DownloadOption[] => {
    if (!mediaInfo?.formats) return [];
    const options: DownloadOption[] = [];
    const addedQualities: { [key: string]: boolean } = {};

    const audioFormats = mediaInfo.formats
        .filter(f => f.audioCodec && f.audioCodec !== 'none' && (!f.videoCodec || f.videoCodec === 'none'))
        .sort((a, b) => (b.abr || 0) - (a.abr || 0));

    if (audioFormats.length > 0) {
        const bestAudio = audioFormats[0];
        if (bestAudio.abr && bestAudio.abr >= 256) {
            options.push({ label: `MP3 - High (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '320kbps', formatDetails: bestAudio });
            addedQualities[`mp3-320kbps`] = true;
        }
        if (bestAudio.abr && bestAudio.abr >= 190) {
            if (!addedQualities[`mp3-192kbps`]) { // Ensure not to add if a higher quality already covers it implicitly
                 options.push({ label: `MP3 - Medium (~${Math.round(bestAudio.abr)}kbps)`, format: 'mp3', quality: '192kbps', formatDetails: bestAudio });
                 addedQualities[`mp3-192kbps`] = true;
            }
        }
        if (!addedQualities[`mp3-128kbps`]) {
            options.push({ label: `MP3 - Standard (~${bestAudio.abr ? Math.round(bestAudio.abr) : 128}kbps)`, format: 'mp3', quality: '128kbps', formatDetails: bestAudio });
            addedQualities[`mp3-128kbps`] = true;
        }
    } else {
        if (!addedQualities[`mp3-128kbps`]) {
            options.push({ label: 'MP3 - 128kbps', format: 'mp3', quality: '128kbps' });
            addedQualities[`mp3-128kbps`] = true;
        }
    }

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
        if (!addedQualities[label]) {
            if (foundFormat) {
                options.push({ label, format: 'mp4', quality: qualityKey, formatDetails: foundFormat });
            } else {
                options.push({ label, format: 'mp4', quality: qualityKey });
            }
            addedQualities[label] = true;
        }
    });
    return options.filter((option, index, self) => index === self.findIndex((o) => o.label === option.label))
        .sort((a,b) => {
        if (a.format === 'mp3' && b.format === 'mp4') return -1;
        if (a.format === 'mp4' && b.format === 'mp3') return 1;
        // Add further sorting if needed, e.g., by quality within mp3/mp4
        return 0;
    });
};


const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  visible, mediaInfo, isLoading, onClose, onSelectOption,
}) => {
  const { theme } = useAppTheme();
  const downloadOptions = React.useMemo(() => generateDownloadOptions(mediaInfo), [mediaInfo]);

  const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: {
      margin: theme.spacing.md,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '90%',
      maxHeight: '80%',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
    modalTitle: { fontSize: theme.typography.fontSize.h1, fontWeight: theme.typography.fontWeight.bold as any, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.primary },
    closeButton: { padding: theme.spacing.xs },
    loader: { marginVertical: theme.spacing.xl },
    emptyText: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', marginVertical: theme.spacing.md, fontFamily: theme.typography.fontFamily.primary },
    optionButton: { paddingVertical: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    optionText: { fontSize: theme.typography.fontSize.bodyLarge, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.primary },
    optionDetailText: { fontSize: theme.typography.fontSize.body, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm, fontFamily: theme.typography.fontFamily.primary },
    separator: { height: 1, backgroundColor: theme.colors.border },
  });

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Download Options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="Close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {isLoading && <ActivityIndicator size="large" color={theme.colors.accentPrimary} style={styles.loader} />}
          {!isLoading && downloadOptions.length === 0 && ( <Text style={styles.emptyText}>No download options available.</Text> )}
          {!isLoading && downloadOptions.length > 0 && (
            <FlatList
              data={downloadOptions}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionButton} onPress={() => onSelectOption(item)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.formatDetails?.filesize ? ( <Text style={styles.optionDetailText}> (~{(item.formatDetails.filesize / 1024 / 1024).toFixed(1)} MB) </Text> ) : null}
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
export default DownloadOptionsModal;
