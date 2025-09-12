import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getClubTypeColor } from '@/utils/clubTypes';

interface Props {
  title: string;
  image?: string | null;
  size?: number;
  theme?: 'light' | 'dark';
  clubType?: string;
  shape?: 'pin' | 'triangle' | 'square' | 'circle';
}

const ClubMarker = ({ title, image, size = 14, theme = 'dark', clubType, shape = 'circle' }: Props) => {
  // Generate a color based on the club name for variety
  const getMarkerColor = (clubName: string) => {
    const colors = [
      '#4F46E5', // Indigo
      '#EC4899', // Pink
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo-400
    ];
    
    if (!clubName) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
      hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Determine border color based on club type; fallback to name-based color if unknown
  const getBorderColor = (clubName: string, clubTypeRaw?: string) => {
    const typeColor = getClubTypeColor(clubTypeRaw);
    if (typeColor) return typeColor;

    // fallback deterministic colors by name
    const borderColors = [
      '#FFFFFF',
      '#FFD700',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
    ];

    if (!clubName) return borderColors[0];

    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
      hash = clubName.charCodeAt(i) + ((hash << 7) - hash);
    }
    const index = Math.abs(hash) % borderColors.length;
    return borderColors[index];
  };

  const markerColor = getMarkerColor(title);
  const borderColor = getBorderColor(title, clubType);
  const displayName = (title || 'Club').trim();
  
  // Calculate sizes; keep overall container height fixed to `size`
  const containerSize = size;
  // Remove inverted triangle pointer for a clean circular badge look
  const pointerHeight = 0;
  const bodySize = containerSize - pointerHeight;
  const borderWidth = 2;
  const imageSize = bodySize - (borderWidth * 2); // Make image fill the entire circle minus border
  
  // Make everything circular
  const borderRadius = bodySize / 2;

  // Reserve space for label so it is captured in marker snapshot
  const labelBlockHeight = Math.max(Math.floor(containerSize * 0.52), 18);
  const labelMaxWidth = Math.max(Math.floor(bodySize * 2.2), 64);

  const containerStyle = {
    width: Math.max(containerSize, labelMaxWidth),
    height: containerSize + labelBlockHeight,
  };

  const bodyStyle = {
    width: bodySize,
    height: bodySize,
    borderRadius: borderRadius,
    backgroundColor: markerColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
  } as const;

  // inner mask handles exact sizing; keep computed values above for clarity

  const textStyle = {
    fontSize: Math.max(bodySize / 3.5, 8),
  };

  return (
    <View 
      style={[styles.container, containerStyle]} 
      pointerEvents="none"
      collapsable={false}
      renderToHardwareTextureAndroid
    >
      {/* Marker Body */}
      <View style={[styles.body, bodyStyle]}>
        <View style={[
          styles.innerMask,
          { width: imageSize, height: imageSize, borderRadius: imageSize / 2 },
        ]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imageFill} />
          ) : (
            <Text style={[styles.fallback, textStyle]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Club label below the marker */}
      <Text numberOfLines={1} style={[styles.label, { maxWidth: labelMaxWidth }] }>
        {displayName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  body: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  innerMask: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pointerOuter: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerInner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  imageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallback: {
    color: '#210808FF',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  label: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default ClubMarker;