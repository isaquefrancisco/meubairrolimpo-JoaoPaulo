import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import DenunciaScreen from './src/screens/DenunciaScreen';
import MapaScreen from './src/screens/MapaScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';

export default function App() {
  const [telaAtiva, setTelaAtiva] = useState('inicio');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />
      
      {/* Área da Tela Ativa */}
      <View style={styles.conteudo}>
        {telaAtiva === 'inicio' && <HomeScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'denuncias' && <DenunciaScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'mapa' && <MapaScreen aoMudarTela={setTelaAtiva} />}
        {telaAtiva === 'estatisticas' && <RelatoriosScreen aoMudarTela={setTelaAtiva} />}
      </View>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540', // Cor do cabeçalho / topo da tela
  },
  conteudo: {
    flex: 1,
    backgroundColor: '#EBF3FA', // Cor de fundo principal do app
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