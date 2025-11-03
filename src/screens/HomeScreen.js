
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Colors from '../styles/colors';
import StatCard from '../components/StatCard';

export default function HomeScreen({ navigation }) {
  const [tab, setTab] = useState('Product');

  const today = useMemo(() => {
    const d = new Date();
    const opts = { month: 'long', day: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{today}</Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Settings')} />
        <TouchableOpacity
          style={styles.bell}
          onPress={() => navigation.navigate('Notifications')}>
          <Text style={{fontSize:18}}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab('Product')}>
          <Text style={[styles.tabText, tab === 'Product' && styles.tabActive]}>Product</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('Overview')}>
          <Text style={[styles.tabText, tab === 'Overview' && styles.tabActive]}>Overview</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <StatCard value="1,100" label="Stuff" tint="blue" onPress={() => { }} />
          <View style={{ width: 16 }} />
          <StatCard value="578" label="Expire" tint="cyan" onPress={() => { }} />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.divider,
    backgroundColor: '#E6EAEE',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F1920',
    marginRight: 14,
  },
  bell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
    marginRight: 14,
  },
  tabText: {
    fontSize: 18,
    color: Colors.textDark,
    marginRight: 16,
    opacity: 0.6,
  },
  tabActive: { opacity: 1, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
