import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DenunciaScreen from './src/screens/DenunciaScreen';
import MapaScreen from './src/screens/MapaScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';
import AdminScreen from './src/screens/AdminScreen';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [modoVisitante, setModoVisitante] = useState(false);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [telaAtiva, setTelaAtiva] = useState('inicio');
  const [modalPerfilVisivel, setModalPerfilVisivel] = useState(false);

  useEffect(() => {
    // Verifica a sessão atual no Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setCarregandoSessao(false);
    });

    // Ouve mudanças no estado de autenticação (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) {
        setModoVisitante(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const confirmarLogout = () => {
    if (!usuario) {
      // Se estiver no modo visitante, voltar para a tela de login
      setModalPerfilVisivel(false);
      setModoVisitante(false);
      setTelaAtiva('inicio');
      return;
    }

    Alert.alert(
      'Sair da Conta',
      'Deseja realmente sair da sua conta e voltar para a tela de login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setModalPerfilVisivel(false);
            await supabase.auth.signOut();
            setUsuario(null);
            setModoVisitante(false);
            setTelaAtiva('inicio');
          }
        }
      ]
    );
  };

  const eAdmin = usuario?.email?.toLowerCase() === 'isaquefrancisco82@gmail.com';

  // Se estiver checando a sessão inicial no Supabase
  if (carregandoSessao) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Se não estiver logado nem no modo visitante, exibe a tela de login
  if (!usuario && !modoVisitante) {
    return (
      <LoginScreen
        aoLogar={(user) => {
          setUsuario(user);
          setTelaAtiva('inicio');
        }}
        aoEntrarComoVisitante={() => {
          setModoVisitante(true);
          setTelaAtiva('inicio');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Cabeçalho Superior com Perfil do Usuário */}
      <View style={styles.topHeader}>
        {/* Espaçador para manter o título centralizado */}
        <View style={{ width: 36 }} />

        <Text style={styles.topHeaderTitle}>Meu Bairro Limpo</Text>

        <TouchableOpacity
          style={styles.userBadgeHeader}
          onPress={() => setModalPerfilVisivel(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={eAdmin ? 'shield-checkmark' : usuario ? 'person-circle' : 'person-outline'}
            size={28}
            color={eAdmin ? '#FCA5A5' : '#93C5FD'}
          />
        </TouchableOpacity>
      </View>

      {/* Área da Tela Ativa */}
      <View style={styles.conteudo}>
        {telaAtiva === 'inicio' && <HomeScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'denuncias' && <DenunciaScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'mapa' && <MapaScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'estatisticas' && <RelatoriosScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'admin' && eAdmin && <AdminScreen aoMudarTela={setTelaAtiva} />}
      </View>

      {/* Modal de Perfil e Sair da Conta */}
      <Modal
        visible={modalPerfilVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalPerfilVisivel(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalPerfilVisivel(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Minha Conta</Text>
              <TouchableOpacity onPress={() => setModalPerfilVisivel(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Avatar e Dados do Usuário */}
            <View style={styles.userProfileCard}>
              <View style={[styles.avatarCircle, eAdmin && styles.avatarAdmin]}>
                <Ionicons
                  name={eAdmin ? 'shield-checkmark' : usuario ? 'person' : 'person-outline'}
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.userEmailText}>
                {usuario ? usuario.email : 'Modo Visitante (Sem Login)'}
              </Text>
              <View style={[styles.roleBadge, eAdmin ? styles.roleAdmin : usuario ? styles.roleUser : styles.roleGuest]}>
                <Text style={[styles.roleText, eAdmin ? styles.roleTextAdmin : usuario ? styles.roleTextUser : styles.roleTextGuest]}>
                  {eAdmin ? 'Administrador' : usuario ? 'Cidadão Cadastrado' : 'Visitante'}
                </Text>
              </View>
            </View>

            {/* Botão de Painel ADM se for Admin */}
            {eAdmin && (
              <TouchableOpacity
                style={styles.btnModalAdm}
                onPress={() => {
                  setModalPerfilVisivel(false);
                  setTelaAtiva('admin');
                }}
              >
                <Ionicons name="shield-half-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.btnModalAdmText}>Ir para o Painel ADM</Text>
              </TouchableOpacity>
            )}

            {/* Botão para Sair / Fazer Login */}
            <TouchableOpacity
              style={[styles.btnModalLogout, !usuario && styles.btnModalLogin]}
              onPress={confirmarLogout}
              activeOpacity={0.8}
            >
              <Ionicons
                name={usuario ? 'log-out-outline' : 'log-in-outline'}
                size={20}
                color={usuario ? '#DC2626' : '#2563EB'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.btnModalLogoutText, !usuario && styles.btnModalLoginText]}>
                {usuario ? 'Sair da Conta (Voltar para o Login)' : 'Fazer Login / Criar Conta'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Inferior (Bottom Tab Bar) */}
      <View style={styles.tabBar}>
        {/* Início */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setTelaAtiva('inicio')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={telaAtiva === 'inicio' ? 'home' : 'home-outline'} 
            size={24} 
            color={telaAtiva === 'inicio' ? '#2563EB' : '#64748B'} 
          />
          <Text style={[styles.tabLabel, telaAtiva === 'inicio' && styles.tabLabelAtivo]}>Início</Text>
        </TouchableOpacity>

        {/* Denúncias */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setTelaAtiva('denuncias')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={telaAtiva === 'denuncias' ? 'document-text' : 'document-text-outline'} 
            size={24} 
            color={telaAtiva === 'denuncias' ? '#2563EB' : '#64748B'} 
          />
          <Text style={[styles.tabLabel, telaAtiva === 'denuncias' && styles.tabLabelAtivo]}>Denúncias</Text>
        </TouchableOpacity>

        {/* Mapa */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setTelaAtiva('mapa')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={telaAtiva === 'mapa' ? 'map' : 'map-outline'} 
            size={24} 
            color={telaAtiva === 'mapa' ? '#2563EB' : '#64748B'} 
          />
          <Text style={[styles.tabLabel, telaAtiva === 'mapa' && styles.tabLabelAtivo]}>Mapa</Text>
        </TouchableOpacity>

        {/* Estatísticas */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setTelaAtiva('estatisticas')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={telaAtiva === 'estatisticas' ? 'stats-chart' : 'stats-chart-outline'} 
            size={24} 
            color={telaAtiva === 'estatisticas' ? '#2563EB' : '#64748B'} 
          />
          <Text style={[styles.tabLabel, telaAtiva === 'estatisticas' && styles.tabLabelAtivo]}>Estatísticas</Text>
        </TouchableOpacity>

        {/* Aba Exclusiva do Administrador */}
        {eAdmin && (
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setTelaAtiva('admin')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={telaAtiva === 'admin' ? 'shield-half' : 'shield-half-outline'} 
              size={24} 
              color={telaAtiva === 'admin' ? '#EF4444' : '#64748B'} 
            />
            <Text style={[styles.tabLabel, telaAtiva === 'admin' && { color: '#EF4444', fontWeight: '700' }]}>
              Painel ADM
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    height: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 50 : 55,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 10,
    backgroundColor: '#0A2540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  topHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  userBadgeHeader: {
    padding: 4,
  },
  conteudo: {
    flex: 1,
    backgroundColor: '#EBF3FA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userProfileCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarAdmin: {
    backgroundColor: '#EF4444',
  },
  userEmailText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleAdmin: {
    backgroundColor: '#FEE2E2',
  },
  roleUser: {
    backgroundColor: '#DBEAFE',
  },
  roleGuest: {
    backgroundColor: '#F1F5F9',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleTextAdmin: {
    color: '#991B1B',
  },
  roleTextUser: {
    color: '#1E40AF',
  },
  roleTextGuest: {
    color: '#475569',
  },
  btnModalAdm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  btnModalAdmText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnModalLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnModalLogin: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  btnModalLogoutText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnModalLoginText: {
    color: '#2563EB',
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelAtivo: {
    color: '#2563EB',
    fontWeight: '700',
  },
});