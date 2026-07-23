import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function MenuLateral({ visivel, aoFechar, aoMudarTela, telaAtiva }) {
  if (!visivel) return null; // Se não for para mostrar, o menu fica invisível

  return (
    <View style={styles.overlay}>
      {/* Área transparente que fecha o menu se o usuário clicar fora */}
      <TouchableOpacity style={styles.touchableClose} onPress={aoFechar} />

      {/* Caixa do Menu Azul Escuro (idêntico ao mockup) */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuHeaderTitle}>Meu Bairro Limpo</Text>
        <View style={styles.divider} />

        {/* Opção Início */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'inicio' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('inicio'); aoFechar(); }}
        >
          <Text style={styles.itemText}>  Início</Text>
        </TouchableOpacity>

        {/* Opção Denúncias */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'denuncias' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('denuncias'); aoFechar(); }}
        >
          <Text style={styles.itemText}>  Denúncias</Text>
        </TouchableOpacity>

        {/* Opção Mapa */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'mapa' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('mapa'); aoFechar(); }}
        >
          <Text style={styles.itemText}> Mapa</Text>
        </TouchableOpacity>

        {/* Opção Estatísticas */}
        <TouchableOpacity 
          style={[styles.menuItem, telaAtiva === 'estatisticas' && styles.itemAtivo]} 
          onPress={() => { aoMudarTela('estatisticas'); aoFechar(); }}
        >
          <Text style={styles.itemText}> Estatísticas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 9999 },
  touchableClose: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }, // Deixa o fundo atrás meio escurinho
  menuContainer: { width: width * 0.75, backgroundColor: '#0A2540', paddingTop: 60, paddingHorizontal: 20 }, // 75% da largura da tela
  menuHeaderTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#ffffff22', marginBottom: 20 },
  menuItem: { paddingVertical: 15, paddingHorizontal: 15, borderRadius: 10, marginBottom: 8 },
  itemAtivo: { backgroundColor: '#2563EB' }, // Azul brilhante para marcar a página atual
  itemText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});