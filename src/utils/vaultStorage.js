import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_WEB = Platform.OS === 'web';
const VAULT_DIR = IS_WEB ? '' : `${FileSystem.documentDirectory || ''}vault/`;
const STORAGE_KEY = 'the_oracle_custom_vault';

export async function initVault() {
  if (IS_WEB) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error initializing vault directory:', error);
  }
}

export async function processGameProfileAsset({ id, title, system, coverAsset, manualAssets, mapAsset, existingProfile = {} }) {
  await initVault();
  const profileId = id || existingProfile.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let coverUri = existingProfile.coverUri || existingProfile.coverUrl || null;
  let manualObj = existingProfile.manual || null;
  let mapObj = existingProfile.map || null;

  if (!IS_WEB && FileSystem.documentDirectory) {
    const profileDir = `${VAULT_DIR}${profileId}/`;
    try {
      await FileSystem.makeDirectoryAsync(profileDir, { intermediates: true });

      // Cover Art
      if (coverAsset && coverAsset.uri) {
        const coverFileName = `cover_${coverAsset.name ? coverAsset.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'cover.png'}`;
        coverUri = `${profileDir}${coverFileName}`;
        await FileSystem.copyAsync({ from: coverAsset.uri, to: coverUri }).catch(() => { coverUri = coverAsset.uri; });
      }

      // Manual Pages
      if (manualAssets && manualAssets.length > 0) {
        const sortedManuals = [...manualAssets].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
        );
        const pageList = [];
        let totalSize = 0;

        for (let i = 0; i < sortedManuals.length; i++) {
          const pageAsset = sortedManuals[i];
          const pageFileName = `manual_p${i}_${pageAsset.name ? pageAsset.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'page'}`;
          const pageUri = `${profileDir}${pageFileName}`;
          await FileSystem.copyAsync({ from: pageAsset.uri, to: pageUri }).catch(() => {});
          totalSize += pageAsset.size || 0;
          pageList.push({
            index: i,
            name: pageAsset.name || `Page ${i + 1}`,
            localUri: pageUri,
            mimeType: pageAsset.mimeType || 'image/png',
            size: pageAsset.size || 0,
          });
        }

        manualObj = {
          name: `${title} Manual`,
          pageCount: pageList.length,
          pages: pageList,
          localUri: pageList[0] ? pageList[0].localUri : null,
          size: totalSize,
        };
        if (!coverUri && pageList[0]) coverUri = pageList[0].localUri;
      }

      // Map Asset
      if (mapAsset && mapAsset.uri) {
        const mapFileName = `map_${mapAsset.name ? mapAsset.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'map.png'}`;
        const mapUri = `${profileDir}${mapFileName}`;
        await FileSystem.copyAsync({ from: mapAsset.uri, to: mapUri }).catch(() => {});
        mapObj = {
          name: mapAsset.name || `${title} Map`,
          localUri: mapUri,
          mimeType: mapAsset.mimeType || 'image/png',
          size: mapAsset.size || 0,
        };
      }
    } catch (e) {
      console.warn('Native storage copy warning:', e);
    }
  } else {
    // Web Fallback
    if (coverAsset && coverAsset.uri) coverUri = coverAsset.uri;
    if (manualAssets && manualAssets.length > 0) {
      const pageList = manualAssets.map((p, i) => ({
        index: i,
        name: p.name || `Page ${i + 1}`,
        localUri: p.uri,
        mimeType: p.mimeType || 'image/png',
        size: p.size || 0,
      }));
      manualObj = {
        name: `${title} Manual`,
        pageCount: pageList.length,
        pages: pageList,
        localUri: pageList[0] ? pageList[0].localUri : null,
      };
      if (!coverUri && pageList[0]) coverUri = pageList[0].localUri;
    }
    if (mapAsset && mapAsset.uri) {
      mapObj = {
        name: mapAsset.name || `${title} Map`,
        localUri: mapAsset.uri,
        mimeType: mapAsset.mimeType || 'image/png',
        size: mapAsset.size || 0,
      };
    }
  }

  return {
    ...existingProfile,
    id: profileId,
    title: title || existingProfile.title || 'Untitled Custom Game',
    system: system || existingProfile.system || 'SNES',
    developer: system || existingProfile.developer || 'Custom Retro Vault Entry',
    coverUrl: coverUri,
    coverUri,
    manual: manualObj,
    map: mapObj,
    status: existingProfile.status || 'backlog',
    vibe: existingProfile.vibe || 'Classic Retro',
    ratingScore: existingProfile.ratingScore || 85,
    summary: existingProfile.summary || `Custom game archived from console platform ${system || 'SNES'}. Includes vault documents and manuals.`,
    releaseYear: existingProfile.releaseYear || new Date().getFullYear(),
    loggedAt: existingProfile.loggedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: existingProfile.source || 'custom_vault',
  };
}
