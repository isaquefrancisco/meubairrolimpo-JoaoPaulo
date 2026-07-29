import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function AdminScreen({ aoMudarTela }) {
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('Todas'); // 'Todas', 'Pendente', 'Concluída'
  const [idProcessando, setIdProcessando] = useState(null);

  const carregarDenuncias = useCallback(async () => {
    try {
      let query = supabase.from('denuncias').select('*');
      
      // Ordena por id decrescente para trazer as mais recentes primeiro
      query = query.order('id', { ascending: false });

      const { data, error } = await query;

      if (error) {
        Alert.alert('Erro', 'Não foi possível carregar as denúncias: ' + error.message);
      } else {
        setDenuncias(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDenuncias();
  }, [carregarDenuncias]);

  const marcarComoConcluida = async (id, statusAtual) => {
    const novoStatus = statusAtual === 'Concluída' ? 'Pendente' : 'Concluída';
    const acaoTexto = novoStatus === 'Concluída' ? 'concluída' : 'pendente';

    Alert.alert(
      'Confirmar Alteração',
      `Deseja marcar esta denúncia como "${novoStatus}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setIdProcessando(id);
            try {
              const { error } = await supabase
                .from('denuncias')
                .update({ status: novoStatus })
                .eq('id', id);

              if (error) {
                Alert.alert('Erro', 'Não foi possível atualizar a denúncia: ' + error.message);
              } else {
                Alert.alert('Sucesso 🎉', `Denúncia marcada como ${acaoTexto}!`);
                setDenuncias(prev =>
                  prev.map(item => (item.id === id ? { ...item, status: novoStatus } : item))
                );
              }
            } catch (err) {
              Alert.alert('Erro', 'Erro ao conectar ao banco de dados.');
            } finally {
              setIdProcessando(null);
            }
          }
        }
      ]
    );
  };

  const excluirDenuncia = (id, titulo) => {
    Alert.alert(
      'Excluir Denúncia',
      `Tem certeza que deseja excluir a denúncia "${titulo}"? Esta ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIdProcessando(id);
            try {
              const { error } = await supabase
                .from('denuncias')
                .delete()
                .eq('id', id);

              if (error) {
                Alert.alert('Erro', 'Não foi possível excluir a denúncia: ' + error.message);
              } else {
                Alert.alert('Sucesso 🗑️', 'Denúncia excluída com sucesso!');
                setDenuncias(prev => prev.filter(item => item.id !== id));
              }
            } catch (err) {
              Alert.alert('Erro', 'Erro ao conectar ao banco de dados.');
            } finally {
              setIdProcessando(null);
            }
          }
        }
      ]
    );
  };

  const denunciasFiltradas = denuncias.filter(item => {
    if (filtroStatus === 'Todas') return true;
    if (filtroStatus === 'Pendente') return item.status !== 'Concluída';
    if (filtroStatus === 'Concluída') return item.status === 'Concluída';
    return true;
  });

  const renderItem = ({ item }) => {
    const isConcluida = item.status === 'Concluída';
    const isUpdating = idProcessando === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoriaBadge}>
            <Ionicons name="pricetag-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.categoriaText}>{item.categoria || 'Geral'}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isConcluida ? styles.statusConcluida : styles.statusPendente
            ]}
          >
            <Ionicons
              name={isConcluida ? 'checkmark-circle' : 'time-outline'}
              size={14}
              color={isConcluida ? '#166534' : '#9A3412'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusText,
                isConcluida ? styles.statusTextConcluida : styles.statusTextPendente
              ]}
            >
              {item.status || 'Pendente'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardDesc}>{item.descricao}</Text>

        {item.localizacao ? (
          <View style={styles.locationWrapper}>
            <Ionicons name="location-sharp" size={16} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>{item.localizacao}</Text>
          </View>
        ) : null}

        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.cardImage} resizeMode="cover" />
        ) : null}

        {/* Linha de Ações: Alterar Status e Excluir */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.btnAction,
              isConcluida ? styles.btnActionDesfazer : styles.btnActionConcluir,
              isUpdating && styles.btnDisabled
            ]}
            onPress={() => marcarComoConcluida(item.id, item.status)}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={isConcluida ? 'refresh-outline' : 'checkmark-done-circle-outline'}
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.btnActionText}>
                  {isConcluida ? 'Reabrir' : 'Concluir'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnDelete, isUpdating && styles.btnDisabled]}
            onPress={() => excluirDenuncia(item.id, item.titulo)}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Header do Painel ADM */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Painel do Administrador</Text>
            <View style={styles.admBadge}>
              <Text style={styles.admBadgeText}>ADM</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Gerenciamento de denúncias públicas</Text>
        </View>

        <TouchableOpacity style={styles.btnRefresh} onPress={carregarDenuncias}>
          <Ionicons name="sync" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de Filtros */}
      <View style={styles.filterContainer}>
        {['Todas', 'Pendente', 'Concluída'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filtroStatus === status && styles.filterTabActive
            ]}
            onPress={() => setFiltroStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filtroStatus === status && styles.filterTabTextActive
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {carregando ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando denúncias...</Text>
        </View>
      ) : (
        <FlatList
          data={denunciasFiltradas}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => {
                setAtualizando(true);
                carregarDenuncias();
              }}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={60} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Nenhuma denúncia encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Não há registros com a opção selecionada ("{filtroStatus}").
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF3FA',
  },
  header: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 2,
  },
  admBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  admBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  btnRefresh: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPendente: {
    backgroundColor: '#FFEDD5',
  },
  statusConcluida: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPendente: {
    color: '#9A3412',
  },
  statusTextConcluida: {
    color: '#166534',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnAction: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  btnActionConcluir: {
    backgroundColor: '#16A34A',
  },
  btnActionDesfazer: {
    backgroundColor: '#D97706',
  },
  btnDelete: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
});
