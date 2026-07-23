# Meu Bairro Limpo — MVP Mobile

> **Disciplina:** Programação para Dispositivos Móveis  
> **Curso:** Análise e Desenvolvimento de Sistemas (ADS) — IFPI Campus Picos  
> **Professor:** Prof. João Paulo  

---

## Equipe de Desenvolvimento

| Integrante | Função / Responsabilidade |
| :--- | :--- |
| **Isaque Francisco** | Front-end & UI/UX Mobile |
| **Raimundo Mateus** | Back-end & Banco de Dados |

---

## Visão Geral & Justificativa

### O Problema
O descarte irregular de lixo, entulho e resíduos sólidos em vias públicas na zona urbana e rural do município de **Picos - PI**. A falta de canais centralizados, rápidos e eficientes impede que a população notifique as ocorrências em tempo real, gerando atrasos na coleta por parte do poder público, proliferação de vetores de doenças (como a dengue) e degradação do ecossistema local.

### Proposta de Valor
O **Meu Bairro Limpo** oferece um ecossistema móvel integrado focado na cidadania e na zeladoria urbana. Através dele, o cidadão consegue registrar uma ocorrência em menos de um minuto: capturando uma fotografia do lixo na hora através da câmera do celular, descrevendo o problema e enviando as informações para um banco de dados unificado na nuvem.

### Objetivos
Desenvolver e homologar um Produto Mínimo Viável (MVP) funcional de uma plataforma móvel e transparente. Espera-se promover o mapeamento dos pontos críticos de contaminação e fornecer uma ferramenta ágil que auxilie os órgãos competentes na tomada de decisões e na otimização das rotas de limpeza urbana em Picos - PI.

---

## Público-Alvo e Histórias de Usuário

### Perfil do Usuário
Cidadãos e moradores de bairros urbanos e comunidades rurais do município de Picos - PI (com idades entre 16 e 70 anos) com acesso a smartphones. Engloba desde usuários com conhecimentos tecnológicos básicos até gestores municipais e agentes de limpeza que necessitam de dados georreferenciados precisos.

### User Stories (Histórias de Usuário)
* **Como cidadão preocupado com o meio ambiente**, eu quero registrar um foco de lixo tirando uma foto na hora com a câmera para que o setor de limpeza saiba a gravidade do problema.
* **Como morador de um bairro afetado**, eu quero visualizar os pontos críticos mapeados na cidade para acompanhar quais áreas estão pendentes de limpeza.
* **Como gestor público urbano**, eu quero acessar gráficos e relatórios estatísticos sobre o volume e os tipos de resíduos descartados para planejar ações preventivas e otimizar recursos.

---

## Definição Técnica (Stack Tecnológica)

| Tecnologia | Finalidade / Descrição |
| :--- | :--- |
| **React Native com Expo (SDK 54)** | Framework cross-platform para desenvolvimento mobile híbrido (iOS / Android / Web). |
| **JavaScript (ES6+)** | Linguagem de programação principal com React Hooks (`useState`, `useEffect`). |
| **Supabase (PostgreSQL)** | Banco de dados relacional na nuvem para persistência dos registros de denúncias. |
| **Supabase Storage (Buckets)** | Armazenamento de mídia física (fotos de ocorrências enviadas pelos usuários). |
| **React Native Maps** | Componente de mapa interativo para renderização de geolocalização e marcadores. |
| **Expo Image Picker** | Integração nativa com a câmera e galeria de fotos do dispositivo móvel. |
| **React Native Web & Polyfill** | Compatibilidade de rede e renderização híbrida entre simuladores de navegadores e aparelhos físicos. |

---

## Escopo de Funcionalidades (MVP)

### Funcionalidades Essenciais Implementadas
1. **Menu Estruturado (Navegação Centralizada por Abas):** Navegação fluida e intuitiva entre as telas principais da aplicação.
2. **Formulário Avançado de Ocorrências:** Cadastro com campos estruturados para Título, Categoria do resíduo (Entulho, Lixo Eletrônico, Orgânico, etc.), Endereço/Bairro e Descrição detalhada.
3. **Captura e Upload de Mídia Dinâmica:** Integração nativa com Câmera e Galeria com envio automatizado para o Supabase Storage.
4. **Mapa Urbano e Listagem Local:** Mapeamento em tempo real dos focos críticos registrados com marcadores dinâmicos.
5. **Painel Estatístico de Transparência (Relatórios):** Exibição de cartões e indicadores consolidados (`COUNT`) dos tipos e quantidades de resíduos registrados.

### Funcionalidades Futuras / Desejáveis
- Autenticação segura de usuários via e-mail e OAuth (Supabase Auth).
- Geolocalização automatizada via GPS em tempo real (Expo Location API).
- Geração e exportação de relatórios analíticos em PDF para a gestão municipal.
- Notificações push de status da resolução da denúncia.

---

## Como Executar o Projeto

### Pré-requisitos
* Node.js (v18 ou superior instalado)
* Gerenciador de pacotes `npm` ou `yarn`
* Aplicativo **Expo Go** instalado no seu smartphone (disponível na App Store ou Google Play Store)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/isaquefrancisco/meubairrolimpo-JoaoPaulo.git
   cd "bairro limpo joao paulo"
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento do Expo:**
   ```bash
   npx expo start
   ```

4. **Testar no dispositivo móvel:**
   * Abra o aplicativo **Expo Go** no seu celular.
   * Escaneie o **QR Code** exibido no terminal.
   * A aplicação será carregada diretamente no seu dispositivo físico!

---

## Testes Realizados & Resultados

### Testes de Funcionalidade e Integração
* **Validação de Formulários:** Verificação de campos obrigatórios antes do envio.
* **Integração com Supabase Storage:** Testes de upload de imagens via dispositivo físico e emulador.
* **Consulta de Dados:** Carregamento dinâmico dos registros no mapa e nos relatórios.

### Avaliação de Usabilidade (Escala SUS - System Usability Scale)
Para avaliar a experiência do usuário, o MVP passou por testes de usabilidade com amostragem de moradores utilizando a escala padronizada **SUS**:
* **Facilidade de Uso:** O fluxo de registro em menos de 1 minuto obteve alta taxa de satisfação.
* **Clareza Visual:** Interface intuitiva para categorização de resíduos.

---

## Instituição & Créditos
* **Instituição:** Instituto Federal do Piauí (IFPI) — Campus Picos  
* **Curso:** Análise e Desenvolvimento de Sistemas (ADS)  
* **Ano Letivo:** 2026  
