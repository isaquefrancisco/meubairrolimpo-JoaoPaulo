import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

const CATEGORIAS_PADRAO = [
  'Lixo e entulho',
  'Esgoto a céu aberto',
  'Buraco na rua',
  'Iluminação pública',
  'Terreno sujo',
  'Árvore oferecendo risco'
];

export default function RelatoriosScreen() {
  const [carregando, setCarregando] = useState(true);
  const [total, setTotal] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [concluidas, setConcluidas] = useState(0);
  const [hoje, setHoje] = useState(0);
  const [ultimos7DiasTotal, setUltimos7DiasTotal] = useState(0);

  const [statsCategorias, setStatsCategorias] = useState({});
  const [dadosEvolucao, setDadosEvolucao] = useState([]);

  useEffect(() => {
    calcularMetricasReais();
  }, []);

  async function calcularMetricasReais() {
    try {
      // Busca todas as denúncias para fazer agregação em JS (mais rápido e flexível para poucos dados)
      const { data, error } = await supabase
        .from('denuncias')
        .select('created_at, categoria, status');

      if (error) throw error;

      const listaDenuncias = data || [];
      const totalRegistros = listaDenuncias.length;

      let countPendentes = 0;
      let countConcluidas = 0;
      let countHoje = 0;
      let count7Dias = 0;

      // Inicializa contagem de categorias padrão
      const contagemCategorias = {};
      CATEGORIAS_PADRAO.forEach(cat => {
        contagemCategorias[cat] = 0;
      });

      const hojeData = new Date();
      const hojeDataStr = hojeData.toDateString();

      const limite7Dias = new Date();
      limite7Dias.setDate(limite7Dias.getDate() - 7);

      // Estrutura para o gráfico dos últimos 7 dias
      const ultimosDias = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ultimosDias.push({
          label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          dataStr: d.toDateString(),
          quantidade: 0
        });
      }

      listaDenuncias.forEach(item => {
        // 1. Status
        if (item.status === 'Concluído') {
          countConcluidas++;
        } else {
          countPendentes++; // Pendente, Em progresso, etc.
        }

        // 2. Data de criação
        if (item.created_at) {
          const dataCriacao = new Date(item.created_at);
          const dataCriacaoStr = dataCriacao.toDateString();

          // Hoje
          if (dataCriacaoStr === hojeDataStr) {
            countHoje++;
          }

          // Últimos 7 dias
          if (dataCriacao >= limite7Dias) {
            count7Dias++;
          }

          // Distribuição de dias
          const diaEncontrado = ultimosDias.find(d => d.dataStr === dataCriacaoStr);
          if (diaEncontrado) {
            diaEncontrado.quantidade++;
          }
        }

        // 3. Categorias
        if (item.categoria) {
          const catNome = item.categoria.trim();
          // Mapeia para uma das padrões se for correspondente
          const correspondente = CATEGORIAS_PADRAO.find(
            c => c.toLowerCase() === catNome.toLowerCase() || 
            c.toLowerCase().includes(catNome.toLowerCase()) ||
            catNome.toLowerCase().includes(c.toLowerCase())
          );

          const chave = correspondente || catNome;
          contagemCategorias[chave] = (contagemCategorias[chave] || 0) + 1;
        }
      });

      setTotal(totalRegistros);
      setPendentes(countPendentes);
      setConcluidas(countConcluidas);
      setHoje(countHoje);
      setUltimos7DiasTotal(count7Dias);
      setStatsCategorias(contagemCategorias);
      setDadosEvolucao(ultimosDias);

    } catch (error) {
      console.log('Erro ao calcular métricas:', error.message);
    } finally {
      setCarregando(false);
    }
  }

  // Acha o dia com mais ocorrências para escalar o gráfico de barras
  const maxQuantidade = Math.max(...dadosEvolucao.map(d => d.quantidade), 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <Text style={styles.headerSubtitle}>Registros: {total}</Text>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Processando estatísticas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.secaoTitulo}>Visão estatística das denúncias</Text>
          <Text style={styles.descricaoIntro}>
            Acompanhe os números da plataforma, identifique os principais tipos de ocorrência e entenda como a situação evoluiu nos últimos dias.
          </Text>

          {/* Grid de Contadores (Mockup 4) */}
          <View style={styles.gridContainer}>
            <View style={styles.miniCard}>
              <Text style={styles.cardLabel}>Total</Text>
              <Text style={styles.cardValue}>{total}</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.cardLabel}>Pendentes</Text>
              <Text style={[styles.cardValue, { color: '#EF4444' }]}>{pendentes}</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.miniCard}>
              <Text style={styles.cardLabel}>Concluídas</Text>
              <Text style={[styles.cardValue, { color: '#16A34A' }]}>{concluidas}</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.cardLabel}>Hoje</Text>
              <Text style={styles.cardValue}>{hoje}</Text>
            </View>
          </View>

          <View style={styles.gridContainerSingle}>
            <View style={styles.largeCard}>
              <Text style={styles.cardLabel}>Últimos 7 dias</Text>
              <Text style={[styles.cardValue, { color: '#2563EB' }]}>{ultimos7DiasTotal}</Text>
            </View>
          </View>

          {/* Card Gráfico Status */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Status das Ocorrências</Text>
            <Text style={styles.chartSubtitle}>Comparação entre pendentes e concluídas no banco.</Text>
            
            {/* Barra Pendentes */}
            <View style={styles.statusRow}>
              <View style={styles.statusLabelRow}>
                <Text style={styles.statusName}>Pendentes</Text>
                <Text style={styles.statusValue}>{pendentes} ({total > 0 ? Math.round((pendentes / total) * 100) : 0}%)</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { 
                  width: `${total > 0 ? (pendentes / total) * 100 : 0}%`, 
                  backgroundColor: '#EF4444' 
                }]} />
              </View>
            </View>

            {/* Barra Concluídas */}
            <View style={styles.statusRow}>
              <View style={styles.statusLabelRow}>
                <Text style={styles.statusName}>Concluídas</Text>
                <Text style={styles.statusValue}>{concluidas} ({total > 0 ? Math.round((concluidas / total) * 100) : 0}%)</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { 
                  width: `${total > 0 ? (concluidas / total) * 100 : 0}%`, 
                  backgroundColor: '#16A34A' 
                }]} />
              </View>
            </View>
          </View>

          {/* Card Tipos de Ocorrência */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Tipos de Ocorrência</Text>
            <Text style={styles.chartSubtitle}>Quais problemas mais aparecem em Picos.</Text>
            
            {Object.entries(statsCategorias).map(([cat, qtd]) => {
              const porcentagem = total > 0 ? Math.round((qtd / total) * 100) : 0;
              return (
                <View key={cat} style={styles.categoriaRow}>
                  <View style={styles.statusLabelRow}>
                    <Text style={styles.categoriaName} numberOfLines={1}>{cat}</Text>
                    <Text style={styles.categoriaValue}>{qtd}</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { 
                      width: `${porcentagem}%`, 
                      backgroundColor: '#2563EB' 
                    }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Gráfico de Evolução Dinâmico (Últimos 7 dias) */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Evolução (Últimos 7 dias)</Text>
            <Text style={styles.chartSubtitle}>Quantidade de denúncias registradas por dia.</Text>
            
            <View style={styles.barsContainer}>
              {dadosEvolucao.map((d, idx) => {
                // Altura da barra baseada no valor proporcional
                const alturaBarra = (d.quantidade / maxQuantidade) * 70; // máximo de 70px de altura
                
                return (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barValueWrapper}>
                      {d.quantidade > 0 && (
                        <Text style={styles.barQuantityLabel}>{d.quantidade}</Text>
                      )}
                      <View style={[styles.barValue, { height: Math.max(alturaBarra, 4) }]} />
                    </View>
                    <Text style={styles.barLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

        </ScrollView>
      )}
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
  
  scrollContainer: { 
    padding: 16,
    paddingBottom: 30
  },
  secaoTitulo: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#0A2540', 
    marginBottom: 6
  },
  descricaoIntro: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20
  },

  gridContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  gridContainerSingle: {
    marginBottom: 12
  },
  miniCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    width: '48%', 
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2 
  },
  largeCard: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    width: '100%', 
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2 
  },
  cardLabel: { 
    fontSize: 13, 
    color: '#64748B', 
    fontWeight: '700' 
  },
  cardValue: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#0A2540', 
    marginTop: 4 
  },

  chartCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2 
  },
  chartTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0A2540' 
  },
  chartSubtitle: { 
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 2, 
    marginBottom: 15 
  },

  statusRow: {
    marginBottom: 12
  },
  statusLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  statusName: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600'
  },
  statusValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700'
  },
  progressBarBackground: { 
    height: 10, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%',
    borderRadius: 5
  },

  categoriaRow: {
    marginBottom: 14
  },
  categoriaName: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
    marginRight: 10
  },
  categoriaValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700'
  },

  barsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'flex-end', 
    height: 105, 
    marginTop: 10 
  },
  barColumn: { 
    alignItems: 'center',
    flex: 1
  },
  barValueWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 85
  },
  barQuantityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2
  },
  barValue: { 
    width: 20, 
    backgroundColor: '#2563EB', 
    borderRadius: 4 
  },
  barLabel: { 
    fontSize: 10, 
    color: '#64748B', 
    marginTop: 8,
    fontWeight: '600'
  }
});