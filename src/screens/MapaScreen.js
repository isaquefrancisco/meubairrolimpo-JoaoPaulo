import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Dimensions, 
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

// Carrega react-native-maps de forma condicional para não quebrar na Web
let MapView = null;
let Marker = null;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.warn("react-native-maps não pôde ser carregado:", e);
  }
}

export default function MapaScreen() {
  const [busca, setBusca] = useState('');
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [fotoExpandida, setFotoExpandida] = useState(null);

  const [regiao, setRegiao] = useState({
    latitude: -7.0812, // Picos - PI
    longitude: -41.4674,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025
  });

  useEffect(() => {
    obterPontosDoMapa();
  }, []);

  async function obterPontosDoMapa() {
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('*'); // Pega todas as colunas incluindo latitude, longitude, foto, status, etc.
      
      if (error) throw error;
      setDenuncias(data || []);
    } catch (error) {
      console.log('Erro ao carregar mapa:', error.message);
    } finally {
      setCarregando(false);
    }
  }

  // Pesquisar local na barra de busca superior
  async function pesquisarLocal() {
    if (!busca.trim()) return;
    setBuscandoLocal(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          busca + ', Picos, Piaui, Brasil'
        )}`,
        {
          headers: {
            'User-Agent': 'MeuBairroLimpoApp/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setRegiao({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      } else {
        Alert.alert('Busca', 'Endereço não encontrado em Picos.');
      }
    } catch (error) {
      console.log('Erro ao buscar local no mapa:', error);
    } finally {
      setBuscandoLocal(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Picos</Text>
        <Text style={styles.headerSubtitle}>Pontos: {denuncias.length}</Text>
      </View>

      {/* Caixa de Busca superior */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Pesquisar local (ex: Avenida Severo)..." 
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={pesquisarLocal}
        />
        <TouchableOpacity style={styles.searchButton} onPress={pesquisarLocal} disabled={buscandoLocal}>
          {buscandoLocal ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Carregando pontos no mapa...</Text>
        </View>
      ) : (
        <View style={styles.mapArea}>
          {Platform.OS === 'web' || !MapView ? (
            <View style={styles.webMapFallback}>
              <Ionicons name="map-outline" size={48} color="#2563EB" style={{ marginBottom: 10 }} />
              <Text style={styles.webMapTitle}>Mapa de Ocorrências (Web)</Text>
              <Text style={styles.webMapSub}>
                O mapa interativo com marcadores reais está ativo ao rodar no celular (Android/iOS).
              </Text>
              
              <Text style={styles.secaoTituloLista}>Lista de Pontos Cadastrados ({denuncias.length})</Text>
              <ScrollView style={styles.webList} showsVerticalScrollIndicator={false}>
                {denuncias.map((item, idx) => (
                  <TouchableOpacity 
                    key={item.id || idx} 
                    style={styles.webItem}
                    onPress={() => setSelectedDenuncia(item)}
                  >
                    <View style={styles.webItemHeader}>
                      <Text style={styles.webItemTitle}>{item.titulo}</Text>
                      <Text style={[
                        styles.webStatus, 
                        { color: (item.status === 'Concluído' || item.status === 'Concluída') ? '#16A34A' : '#EF4444' }
                      ]}>
                        {item.status || 'Pendente'}
                      </Text>
                    </View>
                    <Text style={styles.webItemLocation}>📍 {item.localizacao} ({item.categoria})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={regiao}
              onRegionChangeComplete={setRegiao}
              onPress={() => setSelectedDenuncia(null)} // fecha o card ao clicar fora
            >
              {denuncias.map((item, index) => {
                // Tratamento para registros sem latitude/longitude
                const lat = item.latitude ? parseFloat(item.latitude) : -7.0812 + (Math.sin(index) * 0.008);
                const lon = item.longitude ? parseFloat(item.longitude) : -41.4674 + (Math.cos(index) * 0.008);

                // No Android/iOS (Google Maps), pinColor aceita 'green' e 'red' para manter o pino/seta nativo original
                const isConcluida = item.status === 'Concluído' || item.status === 'Concluída';
                const colorName = isConcluida ? 'green' : 'red';

                return (
                  <Marker
                    key={item.id.toString()}
                    coordinate={{ latitude: lat, longitude: lon }}
                    pinColor={colorName}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedDenuncia(item);
                      setRegiao({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                      });
                    }}
                  />
                );
              })}
            </MapView>
          )}

          {/* Card Flutuante de Detalhes da Denúncia quando clica no marcador */}
          {selectedDenuncia && (
            <View 
              style={styles.detailCard}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailCategory}>{selectedDenuncia.categoria}</Text>
                  <Text style={styles.detailTitle}>{selectedDenuncia.titulo}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeDetailButton} 
                  onPress={() => setSelectedDenuncia(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {selectedDenuncia.foto && (
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={() => {
                    console.log('Abrindo foto:', selectedDenuncia.foto);
                    setFotoExpandida(selectedDenuncia.foto);
                  }}
                  style={styles.detailImageContainer}
                >
                  <Image source={{ uri: selectedDenuncia.foto }} style={styles.detailImage} />
                  <View style={styles.expandOverlay} pointerEvents="none">
                    <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.expandText}>Toque para ampliar</Text>
                  </View>
                </TouchableOpacity>
              )}

              <Text style={styles.detailDesc}>{selectedDenuncia.descricao}</Text>
              
              <View style={styles.detailFooter}>
                <View style={styles.addressContainer}>
                  <Ionicons name="location-sharp" size={14} color="#64748B" />
                  <Text style={styles.detailLocation} numberOfLines={1}>
                    {selectedDenuncia.localizacao}
                  </Text>
                </View>
                
                {/* Badge de Status */}
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: (selectedDenuncia.status === 'Concluído' || selectedDenuncia.status === 'Concluída') ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    { color: (selectedDenuncia.status === 'Concluído' || selectedDenuncia.status === 'Concluída') ? '#15803D' : '#B91C1C' }
                  ]}>
                    {selectedDenuncia.status || 'Pendente'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Modal de Foto em Tela Cheia */}
      <Modal
        visible={!!fotoExpandida}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFotoExpandida(null)}
      >
        <View style={styles.modalOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setFotoExpandida(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {fotoExpandida && (
            <TouchableOpacity 
              style={styles.modalImageWrapper} 
              activeOpacity={1} 
              onPress={() => setFotoExpandida(null)}
            >
              <Image 
                source={{ uri: fotoExpandida }} 
                style={styles.modalFullImage} 
                resizeMode="contain" 
              />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#EBF3FA' 
  },
  header: { 
    backgroundColor: '#0A2540', 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 20, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '800' 
  },
  headerSubtitle: { 
    color: '#94A3B8', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  
  searchContainer: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#FFFFFF', 
    margin: 12, 
    borderRadius: 14, 
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 52 : 65,
    left: 0,
    right: 0,
    zIndex: 10
  },
  searchInput: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    marginRight: 8, 
    fontSize: 13,
    color: '#0F172A'
  },
  searchButton: { 
    backgroundColor: '#0A2540', 
    borderRadius: 10, 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: { 
    color: '#FFFFFF', 
    fontSize: 13,
    fontWeight: '700' 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },

  mapArea: { 
    flex: 1,
    position: 'relative'
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },

  // Card flutuante de detalhes
  detailCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 330
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  detailCategory: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2540',
    marginTop: 2
  },
  closeDetailButton: {
    padding: 2
  },
  detailImageContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 1001
  },
  detailImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  expandOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(10, 37, 64, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  expandText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 100
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 48,
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20
  },
  modalImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalFullImage: {
    width: '94%',
    height: '80%'
  },
  detailDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12
  },
  detailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  detailLocation: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center'
  },
  webMapTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2540',
    textAlign: 'center'
  },
  webMapSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 16
  },
  secaoTituloLista: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A2540',
    alignSelf: 'flex-start',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  webList: {
    width: '100%',
    flex: 1
  },
  webItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  webItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  webItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  webStatus: {
    fontSize: 11,
    fontWeight: '700'
  },
  webItemLocation: {
    fontSize: 12,
    color: '#64748B'
  }
});