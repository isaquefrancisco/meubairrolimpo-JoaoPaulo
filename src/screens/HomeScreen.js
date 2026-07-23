import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ aoMudarTela }) {
  return (
    <View style={styles.container}>
      {/* Header moderno baseado no mockup */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <Text style={styles.headerSubtitle}>Picos - PI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Card Principal - Meu Bairro Limpo */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>Meu Bairro Limpo</Text>
          <Text style={styles.mainCardDesc}>
            Um canal simples e rápido para registrar problemas da cidade com foto, descrição e localização. Ajude a comunidade e facilite o trabalho das equipes responsáveis.
          </Text>

          <TouchableOpacity style={styles.actionButton} onPress={() => aoMudarTela('denuncias')}>
            <Text style={styles.actionButtonText}>Fazer denúncia</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.actionButtonIcon} />
          </TouchableOpacity>

          {/* Lista de Categoria do Problema */}
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>O que pode denunciar?</Text>
            
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Lixo e entulho</Text>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Esgoto a céu aberto</Text>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Buraco na rua</Text>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Iluminação pública</Text>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Terreno sujo</Text>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.checkItemText}>Árvore oferecendo risco</Text>
            </View>
          </View>
        </View>

        {/* Seção de Serviços Disponíveis */}
        <Text style={styles.secaoTitulo}>Navegação Rápida</Text>

        {/* Card Denúncias */}
        <TouchableOpacity style={styles.serviceCard} onPress={() => aoMudarTela('denuncias')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="document-text" size={24} color="#2563EB" />
          </View>
          <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceTitle}>Denúncias</Text>
            <Text style={styles.serviceDesc}>Registre ocorrências com tipo, descrição, foto e localização exata.</Text>
            <Text style={styles.serviceLink}>Abrir formulário ➔</Text>
          </View>
        </TouchableOpacity>

        {/* Card Mapa */}
        <TouchableOpacity style={styles.serviceCard} onPress={() => aoMudarTela('mapa')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="map" size={20} color="#108550" />
          </View>
          <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceTitle}>Mapa</Text>
            <Text style={styles.serviceDesc}>Veja os pontos no mapa de Picos e acompanhe onde estão os problemas.</Text>
            <Text style={styles.serviceLink}>Ver mapa ➔</Text>
          </View>
        </TouchableOpacity>

        {/* Card Estatísticas */}
        <TouchableOpacity style={styles.serviceCard} onPress={() => aoMudarTela('estatisticas')}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="stats-chart" size={24} color="#F97316" />
          </View>
          <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceTitle}>Transparência</Text>
            <Text style={styles.serviceDesc}>Veja dados e relatórios sobre os problemas urbanos de Picos para melhorias.</Text>
            <Text style={styles.serviceLink}>Ver relatórios ➔</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  headerSubtitle: { 
    color: '#94A3B8', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  scrollContainer: { 
    padding: 16,
    paddingBottom: 30
  },
  mainCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  mainCardTitle: { 
    color: '#0A2540', 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 10 
  },
  mainCardDesc: { 
    color: '#475569', 
    fontSize: 14, 
    lineHeight: 20,
    marginBottom: 20 
  },
  actionButton: { 
    backgroundColor: '#2563EB', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  actionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  actionButtonIcon: { 
    marginLeft: 6 
  },
  checklistContainer: { 
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15
  },
  checklistTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0A2540', 
    marginBottom: 10 
  },
  checkItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  bulletPoint: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#3B82F6', 
    marginRight: 10 
  },
  checkItemText: { 
    fontSize: 13, 
    color: '#475569', 
    fontWeight: '500' 
  },
  secaoTitulo: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748B', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 12,
    paddingLeft: 4
  },
  serviceCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  iconWrapper: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16
  },
  serviceTextContainer: { 
    flex: 1 
  },
  serviceTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#0A2540', 
    marginBottom: 4 
  },
  serviceDesc: { 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 18,
    marginBottom: 8
  },
  serviceLink: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#2563EB' 
  }
});