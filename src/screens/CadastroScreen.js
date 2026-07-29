import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function CadastroScreen({ aoLogar, aoVoltarParaLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostraSenha, setMostraSenha] = useState(false);

  const lidarComCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas digitadas não coincidem!');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: { nome: nome.trim() }
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
          Alert.alert(
            'Limite de Envios Excedido ⚠️',
            'O Supabase possui uma proteção padrão que limita a quantidade de e-mails de confirmação enviados por hora.\n\nPor favor, aguarde alguns minutos antes de tentar cadastrar outro e-mail.'
          );
        } else {
          Alert.alert('Erro no Cadastro', error.message);
        }
      } else if (data?.user) {
        Alert.alert(
          'Conta Criada com Sucesso! 🎉',
          'Bem-vindo(a) ao Meu Bairro Limpo. Sua conta foi criada e você já está logado(a)!',
          [
            {
              text: 'Acessar o App',
              onPress: () => aoLogar(data.user)
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao realizar o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Botão de Voltar para Login */}
          <TouchableOpacity style={styles.btnVoltar} onPress={aoVoltarParaLogin}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            <Text style={styles.btnVoltarTexto}>Voltar para o Login</Text>
          </TouchableOpacity>

          {/* Topo com Identidade do App */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>Criar Nova Conta</Text>
            <Text style={styles.appSubtitle}>
              Preencha os dados abaixo para se cadastrar e ajudar seu bairro em Picos - PI
            </Text>
          </View>

          {/* Card do Formulário */}
          <View style={styles.card}>
            {/* Input Nome Completo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#94A3B8"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
            </View>

            {/* Input E-mail */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha (mínimo 6 caracteres)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Crie uma senha forte"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!mostraSenha}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setMostraSenha(!mostraSenha)}>
                  <Ionicons
                    name={mostraSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha novamente"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!mostraSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                />
              </View>
            </View>

            {/* Botão Finalizar Cadastro */}
            <TouchableOpacity
              style={[styles.btnPrimary, carregando && styles.btnDisabled]}
              onPress={lidarComCadastro}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.btnPrimaryText}>Finalizar Cadastro</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Botão para mudar para Tela de Login */}
            <TouchableOpacity style={styles.btnVoltarLogin} onPress={aoVoltarParaLogin}>
              <Text style={styles.btnVoltarLoginTexto}>Já tem uma conta? <Text style={styles.linkTexto}>Fazer Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 20,
    paddingBottom: 30,
  },
  btnVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  btnVoltarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnVoltarLogin: {
    marginTop: 20,
    alignItems: 'center',
  },
  btnVoltarLoginTexto: {
    color: '#64748B',
    fontSize: 14,
  },
  linkTexto: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
