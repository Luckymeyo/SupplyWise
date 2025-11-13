/**
 * Management Screen (Transaction History)
 * Complete transaction log with filters and details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../styles/colors';
import {
  getAllTransactions,
  getTransactionStats,
} from '../database/queries/transactions';

export default function ManagementScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, todayIn: 0, todayOut: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, IN, OUT

  // Load data on mount and when screen comes into focus
  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTransactions, transactionStats] = await Promise.all([
        getAllTransactions(),
        getTransactionStats(),
      ]);

      setTransactions(allTransactions);
      setStats(transactionStats);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  // Format date to Indonesian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `Hari ini, ${hours}:${minutes}`;
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `Kemarin, ${hours}:${minutes}`;
    }

    // Other dates
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format number with thousand separator
  const formatNumber = (value) => {
    return parseFloat(value).toLocaleString('id-ID');
  };

  // Get reason from notes (Stock OUT transactions have reason in notes)
  const parseReason = (notes, type) => {
    if (type !== 'OUT') return null;

    if (!notes) return { reason: 'Lainnya', icon: '📝', color: '#6B7280' };

    const reasonMap = {
      'Terjual': { icon: '💰', color: '#10B981' },
      'Rusak': { icon: '💔', color: '#F59E0B' },
      'Kadaluarsa': { icon: '⏰', color: '#EF4444' },
      'Hilang': { icon: '❓', color: '#6B7280' },
      'Lainnya': { icon: '📝', color: '#6B7280' },
    };

    // Extract reason from notes (format: "Reason - additional notes")
    const reasonMatch = notes.match(/^(Terjual|Rusak|Kadaluarsa|Hilang|Lainnya)/);
    const reasonKey = reasonMatch ? reasonMatch[1] : 'Lainnya';
    
    return {
      reason: reasonKey,
      ...reasonMap[reasonKey],
      additionalNotes: notes.replace(/^(Terjual|Rusak|Kadaluarsa|Hilang|Lainnya)\s*-?\s*/, ''),
    };
  };

  // Render transaction card
  const renderTransaction = (transaction, index) => {
    const isStockIn = transaction.type === 'IN';
    const reasonInfo = parseReason(transaction.notes, transaction.type);

    return (
      <View
        key={transaction.id || index}
        style={[
          styles.transactionCard,
          isStockIn ? styles.cardStockIn : styles.cardStockOut,
        ]}
      >
        {/* Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.transactionHeaderLeft}>
            <View
              style={[
                styles.typeBadge,
                isStockIn ? styles.typeBadgeIn : styles.typeBadgeOut,
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {isStockIn ? '📥 STOK MASUK' : '📤 STOK KELUAR'}
              </Text>
            </View>
          </View>
          <Text style={styles.transactionDate}>{formatDate(transaction.transaction_date)}</Text>
        </View>

        {/* Product Info */}
        <Text style={styles.productName}>{transaction.product_name}</Text>

        {/* Quantity & Unit */}
        <View style={styles.quantityRow}>
          <Text
            style={[
              styles.quantityText,
              isStockIn ? styles.quantityIn : styles.quantityOut,
            ]}
          >
            {isStockIn ? '+' : '-'}{formatNumber(transaction.quantity)} {transaction.unit}
          </Text>
          <Text style={styles.balanceText}>
            Saldo: {formatNumber(transaction.balance_after)} {transaction.unit}
          </Text>
        </View>

        {/* Reason (for Stock OUT) */}
        {reasonInfo && (
          <View style={styles.reasonContainer}>
            <View style={[styles.reasonBadge, { backgroundColor: reasonInfo.color + '20' }]}>
              <Text style={styles.reasonIcon}>{reasonInfo.icon}</Text>
              <Text style={[styles.reasonText, { color: reasonInfo.color }]}>
                {reasonInfo.reason}
              </Text>
            </View>
            {reasonInfo.additionalNotes && (
              <Text style={styles.additionalNotes}>{reasonInfo.additionalNotes}</Text>
            )}
          </View>
        )}

        {/* Batch Info (if available) */}
        {transaction.batch_number && (
          <View style={styles.batchInfo}>
            <Text style={styles.batchLabel}>
              📦 Batch: <Text style={styles.batchValue}>{transaction.batch_number}</Text>
            </Text>
            {transaction.batch_expiry_date && (
              <Text style={styles.batchLabel}>
                ⏰ Exp: <Text style={styles.batchValue}>{formatDate(transaction.batch_expiry_date).split(' ')[0]}</Text>
              </Text>
            )}
          </View>
        )}

        {/* Reference Number (if available) */}
        {transaction.reference_no && (
          <Text style={styles.referenceNo}>Ref: {transaction.reference_no}</Text>
        )}

        {/* Notes (for Stock IN) */}
        {isStockIn && transaction.notes && transaction.notes !== 'Stok masuk' && (
          <Text style={styles.notes}>💬 {transaction.notes}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.cardBlue} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen Transaksi</Text>
          <Text style={styles.headerSubtitle}>Riwayat stok masuk & keluar</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statIcon}>📥</Text>
            <Text style={styles.statLabel}>Total Stok Masuk</Text>
            <Text style={styles.statValue}>{stats.totalIn}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardRed]}>
            <Text style={styles.statIcon}>📤</Text>
            <Text style={styles.statLabel}>Total Stok Keluar</Text>
            <Text style={styles.statValue}>{stats.totalOut}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardCyan]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Hari Ini Masuk</Text>
            <Text style={styles.statValue}>{stats.todayIn}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Hari Ini Keluar</Text>
            <Text style={styles.statValue}>{stats.todayOut}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
            onPress={() => setFilter('ALL')}
          >
            <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
              Semua ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'IN' && styles.filterTabActive]}
            onPress={() => setFilter('IN')}
          >
            <Text style={[styles.filterText, filter === 'IN' && styles.filterTextActive]}>
              📥 Masuk ({transactions.filter((t) => t.type === 'IN').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'OUT' && styles.filterTabActive]}
            onPress={() => setFilter('OUT')}
          >
            <Text style={[styles.filterText, filter === 'OUT' && styles.filterTextActive]}>
              📤 Keluar ({transactions.filter((t) => t.type === 'OUT').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <View style={styles.listContainer}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
              <Text style={styles.emptyText}>
                {filter === 'IN'
                  ? 'Belum ada transaksi stok masuk'
                  : filter === 'OUT'
                  ? 'Belum ada transaksi stok keluar'
                  : 'Transaksi akan muncul di sini setelah Anda melakukan stok masuk atau keluar'}
              </Text>
            </View>
          ) : (
            filteredTransactions.map((transaction, index) =>
              renderTransaction(transaction, index)
            )
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },

  // Header
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statCardRed: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statCardCyan: {
    borderLeftWidth: 4,
    borderLeftColor: '#08B9E5',
  },
  statCardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 4,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.cardBlue,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  filterTextActive: {
    color: Colors.white,
  },

  // Transaction List
  listContainer: {
    paddingHorizontal: 16,
  },
  transactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardStockIn: {
    borderLeftColor: '#10B981',
  },
  cardStockOut: {
    borderLeftColor: '#EF4444',
  },

  // Transaction Header
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionHeaderLeft: {
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeIn: {
    backgroundColor: '#10B98120',
  },
  typeBadgeOut: {
    backgroundColor: '#EF444420',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textLight,
  },

  // Product & Quantity
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
  },
  quantityIn: {
    color: '#10B981',
  },
  quantityOut: {
    color: '#EF4444',
  },
  balanceText: {
    fontSize: 14,
    color: Colors.textLight,
  },

  // Reason
  reasonContainer: {
    marginTop: 8,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  reasonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  additionalNotes: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },

  // Batch & Reference
  batchInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  batchLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  batchValue: {
    fontWeight: '600',
    color: Colors.textDark,
  },
  referenceNo: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  notes: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
