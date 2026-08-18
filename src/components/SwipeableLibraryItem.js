import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SWIPE_THRESHOLD = 60;

export const SwipeableLibraryItem = ({ 
  children, 
  onDelete, 
  onTogglePriority, 
  onOpenJournal, 
  item,
  onPress
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger for horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5 && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        let newDx = gestureState.dx;
        if (isOpenRight) newDx = gestureState.dx - 80; 
        if (isOpenLeft) newDx = gestureState.dx + 140; 
        
        // Dampen swipe
        if (newDx > 160) newDx = 160 + (newDx - 160) * 0.2;
        if (newDx < -100) newDx = -100 + (newDx + 100) * 0.2;
        
        pan.setValue({ x: newDx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        let currentX = pan.x._value;

        if (currentX > SWIPE_THRESHOLD) {
          // Snap open Left (swiped Right)
          Animated.spring(pan, { toValue: { x: 140, y: 0 }, useNativeDriver: true, bounciness: 4 }).start();
          setIsOpenLeft(true);
          setIsOpenRight(false);
        } else if (currentX < -SWIPE_THRESHOLD) {
          // Snap open Right (swiped Left)
          Animated.spring(pan, { toValue: { x: -80, y: 0 }, useNativeDriver: true, bounciness: 4 }).start();
          setIsOpenLeft(false);
          setIsOpenRight(true);
        } else {
          // Snap closed
          closeItem();
        }
      }
    })
  ).current;

  const closeItem = () => {
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 4 }).start();
    setIsOpenLeft(false);
    setIsOpenRight(false);
  };

  const handleDelete = () => {
    closeItem();
    onDelete();
  };

  const handlePriority = () => {
    closeItem();
    onTogglePriority();
  };

  const handleJournal = () => {
    closeItem();
    onOpenJournal();
  };

  return (
    <View style={{ marginBottom: 15, position: 'relative' }}>
      {/* Background Actions Container */}
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
        
        {/* Left Actions (Revealed on Swipe Right) */}
        <View style={{ flexDirection: 'row', width: 140, height: '100%' }}>
          <TouchableOpacity onPress={handlePriority} style={{ flex: 1, backgroundColor: item.priority ? '#222' : '#0a0a0a', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#222' }}>
            <Ionicons name={item.priority ? "star" : "star-outline"} size={22} color={item.priority ? "#ffd700" : "#fff"} />
            <Text style={{ color: item.priority ? '#ffd700' : '#fff', fontSize: 10, marginTop: 4, fontWeight: '500', textTransform: 'uppercase' }}>Priority</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleJournal} style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#222' }}>
            <Ionicons name="journal-outline" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '500', textTransform: 'uppercase' }}>Journal</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions (Revealed on Swipe Left) */}
        <View style={{ width: 80, height: '100%' }}>
          <TouchableOpacity onPress={handleDelete} style={{ flex: 1, backgroundColor: '#ff453a', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' }}>Delete</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Foreground Draggable Item */}
      <Animated.View
        style={{ transform: [{ translateX: pan.x }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {
          if (isOpenLeft || isOpenRight) {
            closeItem();
          } else {
            onPress();
          }
        }}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
