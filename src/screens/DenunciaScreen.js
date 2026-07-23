import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

// Helper de decodificação Base64 para ArrayBuffer
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToArrayBuffer(base64) {
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }

  return arrayBuffer;
}

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

// Categorias idênticas ao mockup
const CATEGORIAS = [
  'Lixo e entulho',
  'Esgoto a céu aberto',
  'Buraco na rua',
  'Iluminação pública',
  'Terreno sujo',
  'Árvore oferecendo risco'
];

export default function DenunciaScreen({ aoMudarTela }) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUri, setImagemUri] = useState(null); 
  const [enviando, setEnviando] = useState(false);
  
  // Controle de categoria
  const [modalCategoriaVisivel, setModalCategoriaVisivel] = useState(false);

  // Estados de localização e mapas
  const [buscaEndereco, setBuscaEndereco] = useState('');
  const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false);
  const [markerCoord, setMarkerCoord] = useState({
    latitude: -7.0812, // Picos - PI
    longitude: -41.4674
  });
  const [regiaoMapa, setRegiaoMapa] = useState({
    latitude: -7.0812,
    longitude: -41.4674,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015
  });

  // Reversa geocodificação ao arrastar/clicar no mapa
  async function atualizarEnderecoPorCoordenadas(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'MeuBairroLimpoApp/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        // Pega partes do endereço (rua, bairro)
        const partes = data.display_name.split(',');
        const ruaBairro = partes.slice(0, 3).join(',').trim();
        setLocalizacao(ruaBairro);
      } else {
        setLocalizacao(`Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Erro reverse geocoding:', error);
      setLocalizacao(`Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
  }

  // Busca endereço por texto (Geocoding)
  async function buscarCoordenadasPorEndereco() {
    if (!buscaEndereco.trim()) return;
    setBuscandoCoordenadas(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          buscaEndereco + ', Picos, Piaui, Brasil'
        )}`,
        {
          headers: {
            'User-Agent': 'MeuBairroLimpoApp/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        
        setMarkerCoord({ latitude: newLat, longitude: newLon });
        setRegiaoMapa({
          latitude: newLat,
          longitude: newLon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });

        const partes = display_name.split(',');
        const ruaBairro = partes.slice(0, 3).join(',').trim();
        setLocalizacao(ruaBairro);
      } else {
        Alert.alert('Busca', 'Endereço não localizado em Picos - PI.');
      }
    } catch (error) {
      console.log('Erro geocoding:', error);
      Alert.alert('Erro', 'Falha ao buscar endereço.');
    } finally {
      setBuscandoCoordenadas(false);
    }
  }

  // Interação ao clicar no mapa
  function handleMapPress(e) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoord({ latitude, longitude });
    atualizarEnderecoPorCoordenadas(latitude, longitude);
  }

  // Camera e Galeria
  function escolherOpcaoFoto() {
    Alert.alert(
      'Anexar Evidência',
      'Como deseja enviar a foto do descarte irregular?',
      [
        { text: ' Tirar Foto Agora', onPress: tirarFoto },
        { text: ' Escolher da Galeria', onPress: selecionarDaGaleria },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!resultado.canceled) setImagemUri(resultado.assets[0].uri);
  }

  async function selecionarDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às fotos.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!resultado.canceled) setImagemUri(resultado.assets[0].uri);
  }

  async function uploadFoto(uri) {
    try {
      let dadosParaUpload;
      let extensao = uri.split('.').pop();
      if (!extensao || extensao.length > 5 || extensao.includes('/') || extensao.includes('?') || extensao.includes(':')) {
        extensao = 'jpg';
      }

      if (Platform.OS === 'web') {
        // Na Web, o fetch + blob funciona perfeitamente
        const resposta = await fetch(uri);
        dadosParaUpload = await resposta.blob();
      } else {
        // No Mobile (Android/iOS), usamos o FileSystem e convertemos para ArrayBuffer
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        dadosParaUpload = base64ToArrayBuffer(base64);
      }

      const nomeArquivo = `${Date.now()}.${extensao}`; 
      const caminhoArquivo = `public/${nomeArquivo}`;

      const { error } = await supabase.storage
        .from('fotos_denuncias')
        .upload(caminhoArquivo, dadosParaUpload, { contentType: `image/${extensao}` });

      if (error) {
        throw new Error(`Upload da foto falhou: ${error.message}`);
      }

      const { data: urlData } = supabase.storage.from('fotos_denuncias').getPublicUrl(caminhoArquivo);
      return urlData.publicUrl;
    } catch (e) {
      throw new Error(`Falha no processamento da imagem: ${e.message || e}`);
    }
  }

  async function salvarDenuncia() {
    if (!titulo || !categoria || !localizacao || !descricao) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    setEnviando(true);
    try {
      let fotoUrlFinal = null;
      if (imagemUri) {
        fotoUrlFinal = await uploadFoto(imagemUri);
      }

      // Salvamos latitude, longitude e status além dos dados comuns
      const { error } = await supabase.from('denuncias').insert([
        { 
          titulo, 
          categoria, 
          localizacao, 
          descricao, 
          foto: fotoUrlFinal,
          latitude: markerCoord.latitude,
          longitude: markerCoord.longitude,
          status: 'Pendente'
        }
      ]);

      if (error) {
        Alert.alert('Erro no Banco', error.message);
      } else {
        Alert.alert('Sucesso 🎉', 'Denúncia registrada com sucesso!');
        setTitulo(''); 
        setCategoria(''); 
        setLocalizacao(''); 
        setDescricao(''); 
        setImagemUri(null);
        setBuscaEndereco('');
        aoMudarTela('inicio'); 
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Erro no envio', `Falha ao processar dados: ${err.message || err}`);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Denúncia</Text>
        <Text style={styles.headerSubtitle}>Picos - PI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Formulário Principal */}
        <View style={styles.cardForm}>
          <Text style={styles.secaoTitulo}>Dados da denúncia</Text>
          
          {/* Título da Denúncia */}
          <Text style={styles.label}>Título da Ocorrência *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Lixo acumulado na calçada" 
            value={titulo} 
            onChangeText={setTitulo} 
          />

          {/* Tipo do problema (Custom Select) */}
          <Text style={styles.label}>Tipo do problema *</Text>
          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={() => setModalCategoriaVisivel(true)}
          >
            <Text style={[styles.selectButtonText, !categoria && { color: '#94A3B8' }]}>
              {categoria || 'Selecione o tipo de problema...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#0A2540" />
          </TouchableOpacity>

          {/* Descrição */}
          <Text style={styles.label}>Descrição *</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Descreva o problema e um ponto de referência com detalhes..." 
            multiline={true} 
            numberOfLines={4}
            value={descricao} 
            onChangeText={setDescricao} 
          />

          {/* Upload de Foto */}
          <Text style={styles.label}>Envie uma foto (Evidência)</Text>
          <TouchableOpacity style={styles.uploadCard} onPress={escolherOpcaoFoto}>
            {imagemUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imagemUri }} style={styles.previewImage} />
                <View style={styles.trocarFotoBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.trocarFotoText}>Trocar foto</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={42} color="#2563EB" />
                <Text style={styles.uploadTitle}>Clique para enviar a foto aqui</Text>
                <Text style={styles.uploadSubtitle}>Tire uma foto ou escolha da galeria (JPG, PNG)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Local da ocorrência */}
        <View style={styles.cardForm}>
          <Text style={styles.secaoTitulo}>Local da ocorrência</Text>
          <Text style={styles.instrucaoTexto}>
            Pesquise um endereço ou clique no mapa para marcar o ponto exato da ocorrência.
          </Text>

          {/* Busca por texto */}
          <View style={styles.buscaContainer}>
            <TextInput 
              style={styles.buscaInput}
              placeholder="Pesquisar local (Ex: Avenida Severo Eulálio)..."
              value={buscaEndereco}
              onChangeText={setBuscaEndereco}
            />
            <TouchableOpacity 
              style={styles.buscaBotao} 
              onPress={buscarCoordenadasPorEndereco}
              disabled={buscandoCoordenadas}
            >
              {buscandoCoordenadas ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buscaBotaoTexto}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Mapa Interativo ou Fallback Web */}
          {Platform.OS === 'web' || !MapView ? (
            <View style={styles.webMapFallback}>
              <Ionicons name="map-outline" size={48} color="#2563EB" />
              <Text style={styles.webMapFallbackText}>
                Mapa interativo está ativo no dispositivo móvel (Android/iOS).
              </Text>
              <Text style={styles.webMapFallbackSub}>
                Ponto selecionado: Lat: {markerCoord.latitude.toFixed(4)}, Lon: {markerCoord.longitude.toFixed(4)}
              </Text>
            </View>
          ) : (
            <View style={styles.mapaContainer}>
              <MapView
                style={styles.mapa}
                region={regiaoMapa}
                onRegionChangeComplete={setRegiaoMapa}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={markerCoord}
                  title="Ponto da ocorrência"
                  description={categoria || "Denúncia de infraestrutura"}
                  pinColor="#2563EB"
                />
              </MapView>
            </View>
          )}

          {/* Campo de texto de endereço preenchido */}
          <Text style={styles.label}>Endereço Completo / Localização *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Endereço aproximado da denúncia"
            value={localizacao} 
            onChangeText={setLocalizacao} 
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.buttonSubmit, enviando && { backgroundColor: '#94A3B8' }]} 
          onPress={salvarDenuncia} 
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonSubmitText}>Enviar denúncia</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Modal / Selector de Categoria */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisivel}
        onRequestClose={() => setModalCategoriaVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo do problema</Text>
              <TouchableOpacity onPress={() => setModalCategoriaVisivel(false)}>
                <Ionicons name="close" size={24} color="#0A2540" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={CATEGORIAS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, categoria === item && styles.modalItemAtivo]}
                  onPress={() => {
                    setCategoria(item);
                    setModalCategoriaVisivel(false);
                  }}
                >
                  <Text style={[styles.modalItemText, categoria === item && styles.modalItemTextAtivo]}>
                    {item}
                  </Text>
                  {categoria === item && (
                    <Ionicons name="checkmark" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
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
    fontWeight: '500', 
    marginTop: 2 
  },
  scrollContainer: { 
    padding: 16,
    paddingBottom: 40 
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 15
  },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569', 
    marginBottom: 6, 
    marginTop: 15 
  },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 14,
    color: '#0F172A'
  },
  selectButton: {
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectButtonText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500'
  },
  textArea: { 
    height: 90, 
    textAlignVertical: 'top' 
  },
  uploadCard: { 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#3B82F6', 
    borderRadius: 15, 
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
    marginTop: 5
  },
  uploadPlaceholder: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 8,
    marginBottom: 2
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#60A5FA',
    textAlign: 'center'
  },
  previewContainer: {
    width: '100%',
    height: 180,
    position: 'relative'
  },
  previewImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover'
  },
  trocarFotoBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  trocarFotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4
  },
  instrucaoTexto: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 15
  },
  buscaContainer: {
    flexDirection: 'row',
    marginBottom: 15
  },
  buscaInput: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8
  },
  buscaBotao: {
    backgroundColor: '#0A2540',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buscaBotaoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  mapaContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 10
  },
  mapa: {
    flex: 1
  },
  buttonSubmit: { 
    backgroundColor: '#2563EB', 
    borderRadius: 16, 
    paddingVertical: 15, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20
  },
  buttonSubmitText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  
  // Estilos do Modal de Categorias
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2540'
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalItemAtivo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8
  },
  modalItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },
  modalItemTextAtivo: {
    color: '#2563EB',
    fontWeight: '700'
  },
  webMapFallback: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 10
  },
  webMapFallbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    textAlign: 'center',
    marginTop: 8
  },
  webMapFallbackSub: {
    fontSize: 12,
    color: '#60A5FA',
    textAlign: 'center',
    marginTop: 4
  }
});