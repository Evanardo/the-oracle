import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/constants';

export const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: '#000000' },
  centerStage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  screenHeader: { padding: 15, paddingTop: 12, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#222' },
  screenTitle: { fontSize: 18, fontWeight: '400', color: '#fff', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  
  // Stats
  collectionStatBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 0.5, borderColor: '#333', marginTop: 6 },
  collectionStatTitle: { color: '#888', fontSize: 11, fontWeight: '400', marginRight: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  collectionStatCount: { color: '#fff', fontSize: 12, fontWeight: '500', marginRight: 6, letterSpacing: 0.5 },
  collectionStatBreakdown: { color: '#666', fontSize: 10, letterSpacing: 0.5 },
  
  deckFilterRow: { flexDirection: 'row', backgroundColor: '#0a0a0a', padding: 4, borderRadius: 20, borderWidth: 0.5, borderColor: '#222' },
  deckFilterChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  deckFilterChipActive: { backgroundColor: '#222' },
  deckFilterText: { color: '#888', fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
  deckFilterTextActive: { color: '#fff' },
  subText: { color: '#666', fontSize: 14, textAlign: 'center', letterSpacing: 0.5, fontWeight: '300' },
  
  // Stack UI
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { color: '#fff', fontSize: 20, fontWeight: '400', marginTop: 15, letterSpacing: 1 },
  emptyStateSubtext: { color: '#666', fontSize: 13, marginTop: 10, textAlign: 'center', letterSpacing: 0.5 },
  stackActionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 12, paddingBottom: 20 },
  stackActionButton: { width: 55, height: 60, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  stackActionButtonSkip: { },
  stackActionButtonPass: { },
  stackActionButtonBacklog: { },
  stackActionButtonWishlist: { },
  stackActionButtonPlayed: { },
  stackActionButtonRewind: { width: 55, height: 60, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  
  // Card UI & 3D Flip
  card: { position: 'absolute', width: SCREEN_WIDTH * 0.9, height: SCREEN_HEIGHT * 0.65, backgroundColor: '#0a0a0a', borderRadius: 16, borderWidth: 0.5, borderColor: '#333', overflow: 'hidden' },
  cardFace: { position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' },
  cardBackFace: { backgroundColor: '#0a0a0a', borderRadius: 16 },
  cardContentLayout: { flex: 1, justifyContent: 'flex-end' },
  artImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  artPlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  
  // Score Badge & Buttons
  scoreBadge: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 0.5, borderColor: '#fff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, zIndex: 10 },
  scoreBadgeText: { color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1 },
  infoFlipButton: { position: 'absolute', top: 15, right: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.4)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, zIndex: 10 },
  infoFlipButtonText: { color: '#fff', fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },
  
  cardFooter: { padding: 20, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.7)' },
  cardTitle: { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 6, letterSpacing: 1, textShadow: '1px 1px 5px rgba(0,0,0,0.9)' },
  cardDeveloper: { fontSize: 14, color: '#aaa', marginBottom: 15, fontWeight: '400', letterSpacing: 0.5 },
  footerPillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  tagPill: { backgroundColor: 'transparent', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 0.5, borderColor: '#555' },
  tagText: { color: '#ccc', fontSize: 11, fontWeight: '400', letterSpacing: 0.5 },
  platformPill: { backgroundColor: 'transparent', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 0.5, borderColor: '#fff' },
  platformText: { color: '#fff', fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },

  // Card Back Layout
  cardBackLayout: { flex: 1, padding: 25, justifyContent: 'space-between' },
  cardBackHeader: { borderBottomWidth: 0.5, borderBottomColor: '#222', paddingBottom: 15, marginBottom: 15 },
  cardBackTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBackTitle: { fontSize: 22, fontWeight: '400', color: '#fff', flex: 1, marginRight: 10, marginBottom: 4, letterSpacing: 0.5 },
  cardBackScoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderWidth: 0.5, borderColor: '#fff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  cardBackScoreText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardBackDeveloper: { fontSize: 13, color: '#888', fontWeight: '400', marginBottom: 10, letterSpacing: 0.5 },
  similarBox: { backgroundColor: '#0a0a0a', borderWidth: 0.5, borderColor: '#333', borderRadius: 8, padding: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  similarText: { color: '#aaa', fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '400' },
  galleryContainer: { marginTop: 5, width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', backgroundColor: '#111', position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  galleryNavLeft: { position: 'absolute', left: 5, top: 0, bottom: 0, justifyContent: 'center', padding: 5 },
  galleryNavRight: { position: 'absolute', right: 5, top: 0, bottom: 0, justifyContent: 'center', padding: 5 },
  galleryDotsContainer: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  galleryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  galleryDotActive: { backgroundColor: '#fff', width: 6, height: 6, borderRadius: 3 },
  
  // Fullscreen Image Modal
  fullscreenModalBackground: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  fullscreenModalClose: { position: 'absolute', top: 50, right: 20, zIndex: 100, padding: 10 },
  fullscreenImageContainer: { width: '100%', height: '80%', position: 'relative' },
  fullscreenImage: { width: '100%', height: '100%' },
  cardBackScroll: { flex: 1, marginVertical: 5 },
  cardBackSectionTitle: { color: '#666', fontSize: 10, fontWeight: '500', letterSpacing: 1.5, marginBottom: 8, marginTop: 10, textTransform: 'uppercase' },
  cardBackDescription: { color: '#aaa', fontSize: 13, lineHeight: 22, fontWeight: '300' },
  flipBackFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', borderWidth: 0.5, borderColor: '#555', paddingVertical: 11, borderRadius: 8, marginTop: 10 },
  flipBackFooterText: { color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' },

  // Overlays (Monochrome replacements for neon colors)
  overlayRight: { position: 'absolute', top: 40, left: 40, transform: [{ rotate: '-15deg' }] },
  overlayTextRight: { borderWidth: 2, borderColor: '#fff', color: '#fff', fontSize: 24, fontWeight: '600', padding: 8, borderRadius: 8, letterSpacing: 4, backgroundColor: 'rgba(0,0,0,0.75)', overflow: 'hidden' },
  overlayLeft: { position: 'absolute', top: 40, right: 40, transform: [{ rotate: '15deg' }] },
  overlayTextLeft: { borderWidth: 2, borderColor: '#666', color: '#666', fontSize: 24, fontWeight: '600', padding: 8, borderRadius: 8, letterSpacing: 4, backgroundColor: 'rgba(0,0,0,0.75)', overflow: 'hidden' },
  overlayUp: { position: 'absolute', bottom: 180, alignSelf: 'center' },
  overlayTextUp: { borderWidth: 2, borderColor: '#ccc', color: '#ccc', fontSize: 24, fontWeight: '600', padding: 8, borderRadius: 8, letterSpacing: 4, backgroundColor: 'rgba(0,0,0,0.75)', overflow: 'hidden' },
  overlayDown: { position: 'absolute', top: 120, alignSelf: 'center' },
  overlayTextDown: { borderWidth: 2, borderColor: '#aaa', color: '#aaa', fontSize: 24, fontWeight: '600', padding: 8, borderRadius: 8, letterSpacing: 4, backgroundColor: 'rgba(0,0,0,0.75)', overflow: 'hidden' },

  // Oracle UI
  oracleFormContainer: { flex: 1, padding: 20, paddingTop: 15 },
  oracleLabel: { color: '#666', fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 20 },
  sourceToggleRow: { flexDirection: 'row', backgroundColor: '#0a0a0a', borderRadius: 8, padding: 4, borderWidth: 0.5, borderColor: '#222' },
  sourceToggle: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  sourceToggleActive: { backgroundColor: '#222' },
  sourceToggleText: { color: '#888', fontWeight: '400', letterSpacing: 0.5 },
  sourceToggleTextActive: { color: '#fff', fontWeight: '500' },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vibeChip: { backgroundColor: '#0a0a0a', borderWidth: 0.5, borderColor: '#333', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  vibeChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  vibeChipText: { color: '#888', fontWeight: '400', letterSpacing: 0.5 },
  vibeChipTextActive: { color: '#000', fontWeight: '500' },
  oracleButton: { backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 0.5, borderColor: '#fff' },
  oracleButtonText: { color: '#fff', fontSize: 12, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' },
  oracleResultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: '#ff5252', marginTop: 20, textAlign: 'center', fontSize: 13, letterSpacing: 0.5 },

  // Library Search Bar
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a', marginHorizontal: 20, marginBottom: 15, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, borderWidth: 0.5, borderColor: '#333' },
  searchBarInput: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 10, outlineStyle: 'none', fontWeight: '300', letterSpacing: 0.5 },

  // Library Tabs (Segmented Control)
  libraryTabsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 8 },
  libraryTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#0a0a0a', borderWidth: 0.5, borderColor: '#333' },
  libraryTabActive: { backgroundColor: '#fff', borderColor: '#fff' },
  libraryTabText: { color: '#888', fontWeight: '400', fontSize: 12, letterSpacing: 0.5 },
  libraryTabTextActive: { color: '#000', fontWeight: '500' },

  // Timeline UI (Library Tab)
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#0a0a0a', padding: 12, borderRadius: 12, borderWidth: 0.5, borderColor: '#222', overflow: 'hidden' },
  timelineImage: { width: 50, height: 70, borderRadius: 6, marginRight: 15, backgroundColor: '#111' },
  timelineImagePlaceholder: { width: 50, height: 70, borderRadius: 6, marginRight: 15, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  timelineContent: { flex: 1, justifyContent: 'center' },
  timelineHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timelineTitle: { color: '#fff', fontSize: 15, fontWeight: '400', flexShrink: 1, marginRight: 10, letterSpacing: 0.5 },
  timelineSub: { color: '#666', fontSize: 12, marginBottom: 4, fontWeight: '300', letterSpacing: 0.5 },
  timelineDate: { color: '#444', fontSize: 10, letterSpacing: 0.5 },
  statusBadge: { borderWidth: 0.5, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, alignSelf: 'flex-start', borderColor: '#444' },
  statusBadgeText: { fontSize: 8, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase', color: '#ccc' },

  // Passport Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  passportContainer: { backgroundColor: '#000', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: SCREEN_HEIGHT * 0.8, borderWidth: 0.5, borderColor: '#333' },
  passportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  passportTitle: { fontSize: 24, fontWeight: '400', color: '#fff', flex: 1, marginRight: 10, letterSpacing: 0.5 },
  passportDev: { fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '300', letterSpacing: 0.5 },
  passportDesc: { fontSize: 14, color: '#aaa', lineHeight: 22, marginBottom: 20, fontWeight: '300' },
  divider: { height: 0.5, backgroundColor: '#222', marginVertical: 15 },
  specsHeader: { color: '#555', fontSize: 10, fontWeight: '500', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a' },
  detailLabel: { color: '#888', fontSize: 13, fontWeight: '300', letterSpacing: 0.5 },
  detailValue: { color: '#fff', fontSize: 13, fontWeight: '400', letterSpacing: 0.5 },
  trojanBox: { marginTop: 25, padding: 15, backgroundColor: '#0a0a0a', borderRadius: 8, borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#333', flexDirection: 'row', alignItems: 'center', gap: 10 },
  trojanText: { color: '#666', fontSize: 12, flex: 1, fontWeight: '300', letterSpacing: 0.5 },

  // Library Edit Controls
  editStatusContainer: { marginTop: 30 },
  editStatusRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  editStatusButton: { width: '48%', paddingVertical: 12, borderRadius: 8, borderWidth: 0.5, borderColor: '#333', alignItems: 'center', backgroundColor: '#0a0a0a' },
  editStatusButtonActive: { backgroundColor: '#fff', borderColor: '#fff' },
  editStatusButtonText: { color: '#666', fontWeight: '500', fontSize: 11, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  editStatusButtonTextActive: { color: '#000' },
  removeButton: { marginTop: 20, marginBottom: 30, backgroundColor: 'transparent', paddingVertical: 12, borderRadius: 8, borderWidth: 0.5, borderColor: '#444', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  removeButtonText: { color: '#888', fontWeight: '500', fontSize: 12, marginLeft: 8, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Custom Confirm Modal
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmDialog: { backgroundColor: '#000', borderRadius: 16, padding: 25, width: '100%', maxWidth: 340, borderWidth: 0.5, borderColor: '#333', alignItems: 'center' },
  confirmTitle: { color: '#fff', fontSize: 18, fontWeight: '400', marginBottom: 15, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' },
  confirmText: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22, fontWeight: '300' },
  confirmButtonRow: { flexDirection: 'row', gap: 15, width: '100%' },
  confirmCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, backgroundColor: '#111', alignItems: 'center', borderWidth: 0.5, borderColor: '#333' },
  confirmCancelText: { color: '#aaa', fontWeight: '500', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  confirmDeleteBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center' },
  confirmDeleteText: { color: '#000', fontWeight: '600', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },

  // Add Game (Search) Modal
  addModalContainer: { backgroundColor: '#000', flex: 1, marginTop: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 0.5, borderColor: '#333' },
  addModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addModalTitle: { fontSize: 20, fontWeight: '400', color: '#fff', letterSpacing: 1, textTransform: 'uppercase' },
  addSearchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  addSearchInput: { flex: 1, backgroundColor: '#0a0a0a', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, color: '#fff', fontSize: 14, borderWidth: 0.5, borderColor: '#333', fontWeight: '300', letterSpacing: 0.5, outlineStyle: 'none' },
  addSearchBtn: { backgroundColor: 'transparent', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 0.5, borderColor: '#fff' },
  addResultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 0.5, borderColor: '#222' },
  addResultImage: { width: 40, height: 60, borderRadius: 6, backgroundColor: '#111' },
  addResultInfo: { flex: 1, marginLeft: 15 },
  addResultTitle: { color: '#fff', fontSize: 15, fontWeight: '400', marginBottom: 4, letterSpacing: 0.5 },
  addResultDev: { color: '#666', fontSize: 12, fontWeight: '300', letterSpacing: 0.5 },
  addResultBtn: { backgroundColor: '#111', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 0.5, borderColor: '#333' },
  addResultBtnText: { color: '#aaa', fontWeight: '500', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  addResultBtnAdded: { backgroundColor: '#fff', borderColor: '#fff' },
  addResultBtnTextAdded: { color: '#000' },
  addEmptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 14, fontWeight: '300', letterSpacing: 0.5 }
});
