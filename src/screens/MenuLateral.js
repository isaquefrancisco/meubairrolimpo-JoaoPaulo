import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MenuLateral({ visivel, aoFechar, aoMudarTela, telaAtiva, usuario, eAdmin, aoSair }) {
  if (!visivel) return null; // Se não for para mostrar, o menu fica invisível

  return (
    <View style={styles.overlay}>
      {/* Área transparente que fecha o menu se o usuário clicar fora */}
      <TouchableOpacity style={styles.touchableClose} onPress={aoFechar} activeOpacity={1} />

      {/* Caixa do Menu Azul Escuro */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuHeaderTitle}>Meu Bairro Limpo</Text>

        {/* Card do Usuário Logado ou Visitante */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons
              name={eAdmin ? 'shield-checkmark' : usuario ? 'person' : 'person-outline'}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {usuario ? usuario.email : 'Visitante'}
            </Text>
            <Text style={styles.userRole}>
              {eAdmin ? 'Administrador' : usuario ? 'Cidadão' : 'Sem login'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Opção Início */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'inicio' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('inicio'); aoFechar(); }}
        >
          <Ionicons name="home-outline" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.itemText}>Início</Text>
        </TouchableOpacity>

        {/* Opção Denúncias */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'denuncias' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('denuncias'); aoFechar(); }}
        >
          <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.itemText}>Denúncias</Text>
        </TouchableOpacity>

        {/* Opção Mapa */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'mapa' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('mapa'); aoFechar(); }}
        >
          <Ionicons name="map-outline" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.itemText}>Mapa</Text>
        </TouchableOpacity>

        {/* Opção Estatísticas */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'estatisticas' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('estatisticas'); aoFechar(); }}
        >
          <Ionicons name="stats-chart-outline" size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.itemText}>Estatísticas</Text>
        </TouchableOpacity>

        {/* Opção Painel ADM (Apenas se for e-mail de admin) */}
        {eAdmin && (
          <TouchableOpacity 
            style={[styles.menuItem, styles.itemAdm, telaAtiva === 'admin' && styles.itemAtivo]} 
            onPress={() => { aoMudarTela('admin'); aoFechar(); }}
          >
            <Ionicons name="shield-half-outline" size={18} color="#FCA5A5" style={{ marginRight: 10 }} />
            <Text style={[styles.itemText, { color: '#FCA5A5', fontWeight: 'bold' }]}>Painel ADM</Text>
          </TouchableOpacity>
        )}

        <View style={styles.flexSpacer} />

        {/* Opção Sair / Fazer Login */}
        <TouchableOpacity
          style={styles.btnLogout}
          onPress={() => {
            aoFechar();
            if (aoSair) aoSair();
          }}
        >
          <Ionicons name={usuario ? 'log-out-outline' : 'log-in-outline'} size={20} color="#F87171" />
          <Text style={styles.btnLogoutText}>
            {usuario ? 'Sair da Conta' : 'Fazer Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 9999 },
  touchableClose: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuContainer: { width: width * 0.78, backgroundColor: '#0A2540', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 50, paddingHorizontal: 20, paddingBottom: 30 },
  menuHeaderTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#93C5FD',
    fontSize: 11,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 6 },
  itemAtivo: { backgroundColor: '#2563EB' },
  itemAdm: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  itemText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  flexSpacer: { flex: 1 },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  btnLogoutText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});