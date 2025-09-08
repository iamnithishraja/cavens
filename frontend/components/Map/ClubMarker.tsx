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
  const pointerHeight = (shape === 'circle' || shape === 'pin') ? Math.max(Math.floor(containerSize * 0.28), 6) : 0;
  const bodySize = containerSize - pointerHeight;
  const borderWidth = 2;
  const imageSize = bodySize - (borderWidth * 2); // Make image fill the entire circle minus border
  
  // Make everything circular
  const borderRadius = bodySize / 2;

  const containerStyle = {
    width: containerSize,
    height: containerSize,
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
      {/* Marker Body (Pin head) */}
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

      {/* Pointer Triangle (for pin/triangle shapes) */}
      {(shape === 'circle' || shape === 'pin') ? (
        <View style={styles.pointerWrap}>
          {/* outer border triangle */}
          <View
            style={[
              styles.pointerOuter,
              {
                borderTopColor: borderColor,
                borderLeftWidth: Math.max(Math.floor(bodySize * 0.22), 4),
                borderRightWidth: Math.max(Math.floor(bodySize * 0.22), 4),
                borderTopWidth: pointerHeight,
              },
            ]}
          />
          {/* inner fill triangle */}
          <View
            style={[
              styles.pointerInner,
              {
                marginTop: -pointerHeight + borderWidth,
                borderLeftWidth: Math.max(Math.floor(bodySize * 0.22) - borderWidth, 2),
                borderRightWidth: Math.max(Math.floor(bodySize * 0.22) - borderWidth, 2),
                borderTopWidth: Math.max(pointerHeight - borderWidth, 1),
                borderTopColor: markerColor,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
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
});

export default ClubMarker;