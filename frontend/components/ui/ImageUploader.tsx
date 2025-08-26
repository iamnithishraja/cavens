import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";

type Props = {
  label: string;
  multiple?: boolean;
  existingUrls?: string[];
  onUploaded: (urls: string[]) => void;
  fullWidth?: boolean;
  squareSize?: number; // used when not fullWidth
  aspectRatio?: number; // used when fullWidth (e.g. 16/9)
  mediaTypes?: ImagePicker.MediaTypeOptions;
  fileNamePrefix?: string; // optional hint to prefix the file name (e.g. "cover-")
};

type Item = { key: string; uri: string; uploading?: boolean; remote?: boolean };

const ImageUploader = ({ 
  label, 
  multiple = false, 
  existingUrls = [], 
  onUploaded, 
  fullWidth = false, 
  squareSize = 90, 
  aspectRatio = 16 / 9, 
  mediaTypes = ImagePicker.MediaTypeOptions.Images, 
  fileNamePrefix 
}: Props) => {
  const [items, setItems] = useState<Item[]>(
    existingUrls.map((u, i) => ({ key: `${i}-${u}`, uri: u, uploading: false, remote: true }))
  );

  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: multiple,
      quality: 0.9,
      selectionLimit: multiple ? 10 : 1,
    });

    if (result.canceled) return;

    const assets = multiple ? result.assets : [result.assets[0]];

    // Optimistically add placeholders so UI shows immediately
    const optimisticItems: Item[] = assets.map((a) => ({ 
      key: `${a.assetId || a.uri}-${Date.now()}`, 
      uri: a.uri, 
      uploading: true 
    }));
    setItems((prev) => (multiple ? [...prev, ...optimisticItems] : [...optimisticItems]));

    // Start uploads in background; don't block add button
    Promise.all(
      assets.map(async (asset, idx) => {
        let fileName = deriveFileName(asset.fileName ?? undefined, asset.uri ?? undefined, asset.mimeType ?? undefined);
        if (fileNamePrefix && !fileName.toLowerCase().includes(fileNamePrefix.toLowerCase())) {
          fileName = `${fileNamePrefix}${fileName}`;
        }
        const fileType = asset.mimeType || guessMimeTypeFromName(fileName);
        const { data } = await apiClient.post("/api/file/upload-url", { fileType, fileName });
        const { uploadUrl, publicUrl } = data;
        const blob = await uriToBlob(asset.uri);
        await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": fileType }, body: blob });
        // Replace optimistic uri with remote url for corresponding placeholder
        const optimisticKey = optimisticItems[idx].key;
        setItems((prev) => prev.map((it) => (it.key === optimisticKey ? { key: optimisticKey, uri: publicUrl, uploading: false, remote: true } : it)));
        // Emit updated remote URL list to parent
        const remoteUrls = (multiple ? [...prevRemoteUrlsRef.current, publicUrl] : [publicUrl]);
        prevRemoteUrlsRef.current = remoteUrls;
        onUploaded(remoteUrls);
      })
    )
      .catch(() => {});
  };

  // Track latest remote URLs to avoid stale closures when uploading
  const prevRemoteUrlsRef = React.useRef<string[]>(existingUrls);

  const handleRemove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    const nextRemote = prevRemoteUrlsRef.current.filter((_, i) => i !== idx);
    prevRemoteUrlsRef.current = nextRemote;
    onUploaded(nextRemote);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[fullWidth ? styles.list : styles.grid]}>
        {items.map((it, i) => (
          <View 
            key={it.key} 
            style={[
              fullWidth ? styles.fullWrapper : styles.thumbWrapper, 
              fullWidth && { aspectRatio },
              it.uploading && styles.uploadingWrapper
            ]}
          > 
            {isVideo(it.uri) ? (
              <VideoPreview uri={it.uri} style={fullWidth ? styles.fullImage : styles.thumb} />
            ) : (
              <Image source={{ uri: it.uri }} style={fullWidth ? styles.fullImage : styles.thumb} />
            )}
            {it.uploading && (
              <View style={styles.uploadOverlay}>
                <Text style={styles.uploadText}>Uploading...</Text>
              </View>
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(i)}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {(multiple || items.length === 0) && (
          <TouchableOpacity 
            style={[
              fullWidth ? styles.fullAddWrapper : styles.addWrapper, 
              fullWidth && { aspectRatio }
            ]} 
            onPress={handlePick}
          >
            <View style={[fullWidth ? styles.fullAddCard : styles.addCard]}>
              <Text style={styles.addIcon}>+</Text>
              <Text style={styles.addText}>{multiple ? "Add Photos" : "Upload"}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const deriveFileName = (fileName?: string, uri?: string, mimeType?: string) => {
  // If original name provided (usually includes extension), use it
  if (fileName) return fileName;

  // Try to infer from URI (often contains extension)
  if (uri) {
    const parts = uri.split("/");
    const last = parts[parts.length - 1] || "";
    if (last && last.includes(".")) return last;
  }

  // Fallback: build a sensible name using mimeType to ensure correct extension
  const timestamp = Date.now();
  const ext = extensionFromMimeType(mimeType) || "jpg";
  return `upload_${timestamp}.${ext}`;
};

const guessMimeTypeFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
};

const extensionFromMimeType = (mime?: string) => {
  if (!mime) return undefined;
  switch (mime.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    case "video/x-m4v":
      return "m4v";
    case "video/webm":
      return "webm";
    default:
      return undefined;
  }
};

const uriToBlob = async (uri: string): Promise<Blob> => {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob;
};

const isVideo = (uri: string) => {
  const lower = uri.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.m4v') || lower.endsWith('.webm');
};

const VideoPreview = ({ uri, style }: { uri: string; style: any }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  return <VideoView style={style} player={player} contentFit="cover" />;
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  list: {
    gap: 12,
  },
  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  fullWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  uploadingWrapper: {
    opacity: 0.7,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: Colors.button.text,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: -1,
  },
  addWrapper: { 
    width: 90, 
    height: 90, 
    borderRadius: 12, 
    overflow: "hidden" 
  },
  addCard: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: 12, 
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.backgroundSecondary,
  },
  fullAddWrapper: { 
    width: "100%", 
    borderRadius: 12, 
    overflow: "hidden" 
  },
  fullAddCard: { 
    alignItems: "center", 
    justifyContent: "center", 
    height: 120, 
    borderRadius: 12, 
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.backgroundSecondary,
  },
  addIcon: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  addText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ImageUploader;